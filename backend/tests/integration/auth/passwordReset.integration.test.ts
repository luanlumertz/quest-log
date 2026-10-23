import { assert, describe, test, vi, afterEach } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { sendEmail } from "../../../src/integrations/mail.js";
import { comparePassword } from "../../../src/lib/bcrypt.js";
import { verifyToken } from "../../../src/lib/jwt.js";

import { createAuthorizedPasswordReset } from "../../fixtures/password.fixture.js";
import { getCookieValue, getAuthCookiesFromResponse } from "../../helpers/http/cookies.helper.js";
import { loginUser } from "../../requests/auth/login.request.js";
import { getCurrentUserResponseWithToken } from "../../requests/auth/me.request.js";
import { resetPassword } from "../../requests/auth/password.request.js";
import { refreshUserWithToken } from "../../requests/auth/refresh.request.js";

describe("POST /auth/password/reset", () => {
    const password = "nova senha123";

    afterEach(() => vi.restoreAllMocks());

    test("deve trocar a senha, consumir a autorização e revogar todos os access e refresh tokens", async () => {
        const { payload, user, resetToken } = await createAuthorizedPasswordReset();
        const firstLogin = await loginUser({ email: payload.email, password: payload.password });
        const secondLogin = await loginUser({ email: payload.email, password: payload.password });

        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 2);

        const response = await resetPassword({ resetToken, password });

        assert.equal(response.status, 204);

        const clearedCookies = getAuthCookiesFromResponse(response);

        assert.include(clearedCookies.accessTokenCookie, "accessToken=;");
        assert.include(clearedCookies.refreshTokenCookie, "refreshToken=;");

        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.notEqual(persisted.passwordHash, password);
        assert.isTrue(await comparePassword(password, persisted.passwordHash));
        assert.equal(persisted.sessionVersion, 1);
        assert.equal(await prisma.passwordRecovery.count({ where: { userId: user.id } }), 0);
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 0);

        for (const login of [firstLogin, secondLogin]) {
            const accessToken = getCookieValue(login, "accessToken");
            const refreshToken = getCookieValue(login, "refreshToken");

            assert.exists(accessToken);
            assert.exists(refreshToken);

            const me = await getCurrentUserResponseWithToken(accessToken);
            const refresh = await refreshUserWithToken(refreshToken);

            assert.equal(me.status, 401);
            assert.equal(refresh.status, 401);
        }

        const reused = await resetPassword({ resetToken, password: "outra senha123" });
        const oldLogin = await loginUser({ email: payload.email, password: payload.password });
        const newLogin = await loginUser({ email: payload.email, password });

        assert.equal(reused.status, 400);
        assert.equal(oldLogin.status, 401);
        assert.equal(newLogin.status, 200);

        const accessToken = getCookieValue(newLogin, "accessToken");
        const refreshToken = getCookieValue(newLogin, "refreshToken");

        assert.exists(accessToken);
        assert.exists(refreshToken);
        assert.equal(verifyToken(accessToken).sessionVersion, 1);

        const me = await getCurrentUserResponseWithToken(accessToken);
        const refresh = await refreshUserWithToken(refreshToken);

        assert.equal(me.status, 200);
        assert.equal(refresh.status, 204);

        const notification = vi.mocked(sendEmail).mock.calls.at(-1)?.[0];

        assert.exists(notification);
        assert.equal(notification.to, payload.email);
        assert.equal(notification.subject, "Sua senha foi alterada - QuestLog");
        assert.include(notification.text, "Todas as sessões foram encerradas.");
        assert.notInclude(notification.text, password);
        assert.notInclude(notification.text, resetToken);
    });

    test("deve rejeitar a mesma senha e permitir outra senha usando a mesma autorização", async () => {
        const { payload, user, resetToken } = await createAuthorizedPasswordReset();

        await loginUser({ email: payload.email, password: payload.password });

        const userBefore = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const sessionsBefore = await prisma.refreshSession.findMany({ where: { userId: user.id } });
        const recoveryBefore = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });
        const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

        const response = await resetPassword({ resetToken, password: payload.password });

        assert.equal(response.status, 422);
        assert.equal(response.body.message, "A nova senha deve ser diferente da senha atual.");
        assert.notExists(response.headers["set-cookie"]);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore);

        const userAfter = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const sessionsAfter = await prisma.refreshSession.findMany({ where: { userId: user.id } });
        const recoveryAfter = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });

        assert.equal(userAfter.passwordHash, userBefore.passwordHash);
        assert.equal(userAfter.sessionVersion, userBefore.sessionVersion);
        assert.deepEqual(sessionsAfter, sessionsBefore);
        assert.deepEqual(recoveryAfter, recoveryBefore);

        const retry = await resetPassword({ resetToken, password });
        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.equal(retry.status, 204);
        assert.isTrue(await comparePassword(password, persisted.passwordHash));
        assert.equal(persisted.sessionVersion, 1);
        assert.equal(await prisma.passwordRecovery.count({ where: { userId: user.id } }), 0);
        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 0);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore + 1);
    });

    test.each(["inexistente", "expirada"] as const)(
        "não deve alterar senha nem consumir autorização com uma autorização %s",
        async (scenario) => {
            const { payload, user, recovery, resetToken } = await createAuthorizedPasswordReset();
            const userBefore = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
            const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

            if (scenario === "expirada") {
                await prisma.passwordRecovery.update({
                    where: { id: recovery.id },
                    data: { resetTokenExpiresAt: new Date(0) },
                });
            }

            const response = await resetPassword({
                resetToken: scenario === "inexistente" ? "a".repeat(64) : resetToken,
                password: payload.password,
            });

            assert.equal(response.status, 400);
            assert.equal(
                response.body.message,
                "Autorização inválida ou expirada. Solicite um novo código.",
            );
            assert.notExists(response.headers["set-cookie"]);
            assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore);

            const userAfter = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

            assert.equal(userAfter.passwordHash, userBefore.passwordHash);
            assert.equal(userAfter.sessionVersion, 0);
            assert.equal(await prisma.passwordRecovery.count({ where: { userId: user.id } }), 1);
        },
    );

    test("deve concluir apenas uma redefinição em requisições simultâneas", async () => {
        const { user, resetToken } = await createAuthorizedPasswordReset();
        const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

        const responses = await Promise.all([
            resetPassword({ resetToken, password }),
            resetPassword({ resetToken, password: "outra senha123" }),
        ]);

        assert.sameMembers(
            responses.map((response) => response.status),
            [204, 400],
        );
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore + 1);

        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const winningPassword = responses[0]!.status === 204 ? password : "outra senha123";

        assert.equal(persisted.sessionVersion, 1);
        assert.isTrue(await comparePassword(winningPassword, persisted.passwordHash));
        assert.equal(await prisma.passwordRecovery.count(), 0);
    });

    test("não deve desfazer a troca nem devolver erro se o aviso por e-mail falhar", async () => {
        const { user, resetToken } = await createAuthorizedPasswordReset();
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(sendEmail).mockRejectedValueOnce(new Error("SMTP indisponível"));

        const response = await resetPassword({ resetToken, password });

        assert.equal(response.status, 204);
        assert.equal(log.mock.calls.length, 1);

        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.isTrue(await comparePassword(password, persisted.passwordHash));
        assert.equal(persisted.sessionVersion, 1);
        assert.equal(await prisma.passwordRecovery.count(), 0);
    });
});
