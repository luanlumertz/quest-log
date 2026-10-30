import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as environment from "../../../src/lib/appEnvironment.js";
import { prisma } from "../../../src/lib/prisma.js";
import { generateToken } from "../../../src/lib/jwt.js";
import { createUser, recordSandboxActivity } from "../../../src/repositories/user.repository.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { loginUser } from "../../requests/auth/login.request.js";
import {
    getCurrentUserResponse,
    getCurrentUserResponseWithToken,
} from "../../requests/auth/me.request.js";
import { refreshUser, refreshUserWithToken } from "../../requests/auth/refresh.request.js";

const previousActivity = new Date("2020-01-01T00:00:00.000Z");

describe("Última atividade autenticada do sandbox", () => {
    beforeEach(() => {
        vi.spyOn(environment, "getAppEnvironment").mockReturnValue("sandbox");
    });

    afterEach(() => vi.restoreAllMocks());

    test("deve iniciar a contagem quando a conta é criada pela verificação de cadastro", async () => {
        const startedAt = new Date();

        const { user } = await createRegisteredUser();
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect(saved.lastActiveAt).toBeInstanceOf(Date);
        expect(saved.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(startedAt.getTime());
        expect(user).not.toHaveProperty("lastActiveAt");
    });

    test("deve iniciar a contagem também na criação direta pelo repositório", async () => {
        const startedAt = new Date();

        const user = await createUser({
            name: "Teste",
            email: "teste@email.com",
            passwordHash: "hash",
        });

        expect(user.lastActiveAt).toBeInstanceOf(Date);
        expect(user.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(startedAt.getTime());
    });

    test("deve registrar atividade quando o login cria uma sessão válida", async () => {
        const { user, payload } = await createRegisteredUser();
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: previousActivity },
        });
        const startedAt = new Date();

        const response = await loginUser({ email: payload.email, password: payload.password });
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect(response.status).toBe(200);
        expect(saved.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(startedAt.getTime());
        expect(response.body.user).not.toHaveProperty("lastActiveAt");
    });

    test("deve registrar atividade em uma consulta protegida", async () => {
        const { user, agent } = await createAuthenticatedAgent();
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: previousActivity },
        });
        const startedAt = new Date();

        const response = await getCurrentUserResponse(agent);
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect(response.status).toBe(200);
        expect(saved.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(startedAt.getTime());
        expect(response.body.user).not.toHaveProperty("lastActiveAt");
    });

    test("deve registrar atividade na renovação real da sessão", async () => {
        const { user, agent } = await createAuthenticatedAgent();
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: previousActivity },
        });
        const startedAt = new Date();

        const response = await refreshUser(agent);
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect(response.status).toBe(204);
        expect(saved.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(startedAt.getTime());
    });

    test("deve preencher a primeira atividade de uma conta existente com campo nulo", async () => {
        const { user, agent } = await createAuthenticatedAgent();
        await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: null } });

        const response = await getCurrentUserResponse(agent);
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect(response.status).toBe(200);
        expect(saved.lastActiveAt).toBeInstanceOf(Date);
    });

    test("não deve registrar atividade em tentativas de autenticação rejeitadas", async () => {
        const { user, payload } = await createRegisteredUser();
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: previousActivity },
        });

        const login = await loginUser({ email: payload.email, password: "senha-incorreta" });
        const invalidToken = await getCurrentUserResponseWithToken("invalido");
        const revokedToken = await getCurrentUserResponseWithToken(generateToken(user.id, 1));
        const refresh = await refreshUserWithToken("invalido");
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect([login.status, invalidToken.status, revokedToken.status, refresh.status]).toEqual([
            401, 401, 401, 401,
        ]);
        expect(saved.lastActiveAt).toEqual(previousActivity);
    });

    test("não deve retroceder uma atividade mais recente", async () => {
        const { user } = await createRegisteredUser();
        const newerActivity = new Date(Date.now() + 60_000);
        await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: newerActivity } });

        await recordSandboxActivity(user.id, 0);
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect(saved.lastActiveAt).toEqual(newerActivity);
    });

    test("não deve atualizar atividade se a versão da sessão mudou após a autenticação", async () => {
        const { user } = await createRegisteredUser();
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: previousActivity, sessionVersion: 1 },
        });

        await recordSandboxActivity(user.id, 0);
        const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        expect(saved.lastActiveAt).toEqual(previousActivity);
    });

    test.each(["development", "test", "production"] as const)(
        "não deve registrar atividade no ambiente %s",
        async (appEnvironment) => {
            vi.mocked(environment.getAppEnvironment).mockReturnValue(appEnvironment);

            const { user, agent } = await createAuthenticatedAgent();
            const query = await getCurrentUserResponse(agent);
            const refresh = await refreshUser(agent);
            const saved = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

            expect(query.status).toBe(200);
            expect(refresh.status).toBe(204);
            expect(saved.lastActiveAt).toBeNull();
        },
    );
});
