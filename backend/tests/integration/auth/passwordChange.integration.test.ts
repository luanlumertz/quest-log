import { assert, describe, test } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { comparePassword } from "../../../src/lib/bcrypt.js";

import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { getCookieValue } from "../../helpers/http/cookies.helper.js";
import {
    changePassword,
    changePasswordWithoutCookies,
    requestPasswordRecovery,
} from "../../requests/auth/password.request.js";
import { getCurrentUserResponse } from "../../requests/auth/me.request.js";
import { loginUser } from "../../requests/auth/login.request.js";
import { refreshUserWithToken } from "../../requests/auth/refresh.request.js";

describe("PATCH /auth/me/password", () => {
    const password = "senha nova123";

    test("deve exigir a senha atual, encerrar a sessão e remover recuperações pendentes", async () => {
        const { agent, user, registerPayload, loginResponse } = await createAuthenticatedAgent();

        await requestPasswordRecovery({ email: registerPayload.email });

        const response = await changePassword(agent, {
            currentPassword: registerPayload.password,
            password,
        });

        assert.equal(response.status, 204);

        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.isTrue(await comparePassword(password, persisted.passwordHash));
        assert.equal(persisted.sessionVersion, 1);
        assert.equal(await prisma.passwordRecovery.count({ where: { userId: user.id } }), 0);
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 0);

        const me = await getCurrentUserResponse(agent);
        const refreshToken = getCookieValue(loginResponse, "refreshToken");

        assert.exists(refreshToken);

        const refresh = await refreshUserWithToken(refreshToken);
        const login = await loginUser({ email: registerPayload.email, password });

        assert.equal(me.status, 401);
        assert.equal(refresh.status, 401);
        assert.equal(login.status, 200);
    });

    test("não deve alterar a senha nem encerrar a sessão quando a senha atual estiver incorreta", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();

        const response = await changePassword(agent, { currentPassword: "senha errada", password });

        assert.equal(response.status, 400);
        assert.equal(response.body.message, "Senha atual incorreta.");
        assert.notExists(response.headers["set-cookie"]);

        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const me = await getCurrentUserResponse(agent);

        assert.isTrue(await comparePassword(registerPayload.password, persisted.passwordHash));
        assert.equal(persisted.sessionVersion, 0);
        assert.equal(me.status, 200);
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 1);
    });

    test("não deve alterar senha sem autenticação mesmo recebendo uma senha atual", async () => {
        const response = await changePasswordWithoutCookies({
            currentPassword: "senha atual",
            password,
        });

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Não autenticado");
        assert.equal(await prisma.user.count(), 0);
    });

    test("deve rejeitar uma nova senha inválida sem modificar a conta", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();

        const response = await changePassword(agent, {
            currentPassword: registerPayload.password,
            password: "curta",
        });

        assert.equal(response.status, 422);
        assert.equal(response.body.error, "Erro de Validação");

        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.isTrue(await comparePassword(registerPayload.password, persisted.passwordHash));
        assert.equal(persisted.sessionVersion, 0);
    });
});
