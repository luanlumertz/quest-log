import { assert, describe, test, vi, afterEach } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { comparePassword } from "../../../src/lib/bcrypt.js";
import { verifyToken } from "../../../src/lib/jwt.js";
import { sendEmail } from "../../../src/integrations/mail.js";
import * as refreshTokenLib from "../../../src/lib/refreshToken.js";

import { createAuthenticatedAgent } from "../../fixtures/auth.fixture.js";
import { getCookieValue } from "../../helpers/http/cookies.helper.js";
import {
    changePassword,
    changePasswordWithoutCookies,
    requestPasswordRecovery,
} from "../../requests/auth/password.request.js";
import {
    getCurrentUserResponse,
    getCurrentUserResponseWithToken,
} from "../../requests/auth/me.request.js";
import { loginUser } from "../../requests/auth/login.request.js";
import { refreshUser, refreshUserWithToken } from "../../requests/auth/refresh.request.js";

describe("PATCH /auth/me/password", () => {
    const password = "senha nova123";

    afterEach(() => vi.restoreAllMocks());

    test("deve renovar a sessão atual, revogar os tokens anteriores e remover recuperações pendentes", async () => {
        const { agent, user, registerPayload, loginResponse } = await createAuthenticatedAgent();
        const otherLogin = await loginUser({
            email: registerPayload.email,
            password: registerPayload.password,
        });

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
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 1);

        const accessToken = getCookieValue(response, "accessToken");
        const refreshToken = getCookieValue(response, "refreshToken");

        assert.exists(accessToken);
        assert.exists(refreshToken);
        assert.equal(verifyToken(accessToken).sessionVersion, 1);
        assert.notEqual(accessToken, getCookieValue(loginResponse, "accessToken"));
        assert.notEqual(refreshToken, getCookieValue(loginResponse, "refreshToken"));

        const session = await prisma.refreshSession.findFirstOrThrow({
            where: { userId: user.id },
        });

        assert.equal(session.tokenHash, refreshTokenLib.hashRefreshToken(refreshToken));

        for (const oldLogin of [loginResponse, otherLogin]) {
            const oldAccessToken = getCookieValue(oldLogin, "accessToken");
            const oldRefreshToken = getCookieValue(oldLogin, "refreshToken");

            assert.exists(oldAccessToken);
            assert.exists(oldRefreshToken);

            const me = await getCurrentUserResponseWithToken(oldAccessToken);
            const refresh = await refreshUserWithToken(oldRefreshToken);

            assert.equal(me.status, 401);
            assert.equal(refresh.status, 401);
        }

        const me = await getCurrentUserResponse(agent);
        const refresh = await refreshUser(agent);

        assert.equal(me.status, 200);
        assert.equal(refresh.status, 204);
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 1);

        const oldPasswordLogin = await loginUser({
            email: registerPayload.email,
            password: registerPayload.password,
        });
        const login = await loginUser({ email: registerPayload.email, password });

        assert.equal(oldPasswordLogin.status, 401);
        assert.equal(login.status, 200);

        const notification = vi.mocked(sendEmail).mock.calls.at(-1)?.[0];

        assert.exists(notification);
        assert.include(notification.text, "As outras sessões foram encerradas.");
        assert.notInclude(notification.text, "Todas as sessões foram encerradas.");
        assert.notInclude(notification.text, password);
    });

    test("deve permitir outra troca usando a sessão renovada sem exigir novo login", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();

        const first = await changePassword(agent, {
            currentPassword: registerPayload.password,
            password,
        });
        const second = await changePassword(agent, {
            currentPassword: password,
            password: "segunda senha123",
        });

        assert.equal(first.status, 204);
        assert.equal(second.status, 204);

        const accessToken = getCookieValue(second, "accessToken");
        const previousAccessToken = getCookieValue(first, "accessToken");

        assert.exists(accessToken);
        assert.exists(previousAccessToken);
        assert.equal(verifyToken(accessToken).sessionVersion, 2);

        const me = await getCurrentUserResponse(agent);
        const previousMe = await getCurrentUserResponseWithToken(previousAccessToken);
        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.equal(me.status, 200);
        assert.equal(previousMe.status, 401);
        assert.equal(persisted.sessionVersion, 2);
        assert.isTrue(await comparePassword("segunda senha123", persisted.passwordHash));
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 1);
    });

    test("deve manter a sessão renovada mesmo se o aviso por e-mail falhar", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(sendEmail).mockRejectedValueOnce(new Error("SMTP indisponível"));

        const response = await changePassword(agent, {
            currentPassword: registerPayload.password,
            password,
        });
        const me = await getCurrentUserResponse(agent);
        const refresh = await refreshUser(agent);

        assert.equal(response.status, 204);
        assert.equal(me.status, 200);
        assert.equal(refresh.status, 204);
        assert.equal(log.mock.calls.length, 1);
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 1);
    });

    test("deve desfazer a troca inteira se não conseguir criar a sessão substituta", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();
        const other = await createAuthenticatedAgent({ email: "outra-conta@email.com" });
        const conflictingToken = getCookieValue(other.loginResponse, "refreshToken");

        assert.exists(conflictingToken);

        const userBefore = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const sessionBefore = await prisma.refreshSession.findFirstOrThrow({
            where: { userId: user.id },
        });

        await requestPasswordRecovery({ email: registerPayload.email });

        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(refreshTokenLib, "generateRefreshToken").mockReturnValue(conflictingToken);

        const response = await changePassword(agent, {
            currentPassword: registerPayload.password,
            password,
        });

        assert.equal(response.status, 500);
        assert.equal(response.body.message, "Erro interno do servidor");
        assert.notExists(response.headers["set-cookie"]);

        const userAfter = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const sessionAfter = await prisma.refreshSession.findFirstOrThrow({
            where: { userId: user.id },
        });
        const me = await getCurrentUserResponse(agent);

        assert.equal(userAfter.passwordHash, userBefore.passwordHash);
        assert.equal(userAfter.sessionVersion, userBefore.sessionVersion);
        assert.equal(sessionAfter.id, sessionBefore.id);
        assert.equal(sessionAfter.tokenHash, sessionBefore.tokenHash);
        assert.equal(await prisma.passwordRecovery.count({ where: { userId: user.id } }), 1);
        assert.equal(me.status, 200);
    });

    test("deve rejeitar a mesma senha sem renovar a sessão, consumir recuperações ou enviar aviso", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();

        await requestPasswordRecovery({ email: registerPayload.email });

        const userBefore = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const sessionsBefore = await prisma.refreshSession.findMany({ where: { userId: user.id } });
        const recoveryBefore = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });
        const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

        const response = await changePassword(agent, {
            currentPassword: registerPayload.password,
            password: registerPayload.password,
        });

        assert.equal(response.status, 422);
        assert.equal(response.body.message, "A nova senha deve ser diferente da senha atual.");
        assert.notExists(response.headers["set-cookie"]);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore);

        const userAfter = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const sessionsAfter = await prisma.refreshSession.findMany({ where: { userId: user.id } });
        const recoveryAfter = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });
        const me = await getCurrentUserResponse(agent);

        assert.equal(userAfter.passwordHash, userBefore.passwordHash);
        assert.equal(userAfter.sessionVersion, userBefore.sessionVersion);
        assert.deepEqual(sessionsAfter, sessionsBefore);
        assert.deepEqual(recoveryAfter, recoveryBefore);
        assert.equal(me.status, 200);
    });

    test("não deve alterar a senha nem encerrar a sessão quando a senha atual estiver incorreta", async () => {
        const { agent, user, registerPayload } = await createAuthenticatedAgent();

        const response = await changePassword(agent, {
            currentPassword: "senha errada",
            password: registerPayload.password,
        });

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
