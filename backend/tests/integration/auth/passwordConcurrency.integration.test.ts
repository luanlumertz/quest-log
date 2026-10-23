import { assert, describe, test, expect, vi } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { sendEmail } from "../../../src/integrations/mail.js";
import { hashPassword } from "../../../src/lib/bcrypt.js";
import {
    generatePasswordResetToken,
    hashPasswordResetToken,
} from "../../../src/lib/passwordResetToken.js";
import {
    authorizePasswordReset,
    changePasswordAndRevokeSessions,
    incrementPasswordRecoveryAttempts,
    invalidatePasswordRecoveryCode,
} from "../../../src/repositories/passwordRecovery.repository.js";
import {
    createRefreshSession,
    rotateRefreshSession,
} from "../../../src/repositories/refreshSession.repository.js";

import { createRegisteredUser } from "../../fixtures/auth.fixture.js";
import {
    createAuthorizedPasswordReset,
    createPasswordRecovery,
} from "../../fixtures/password.fixture.js";
import { loginUser } from "../../requests/auth/login.request.js";
import {
    requestPasswordRecovery,
    resendPasswordRecoveryCode,
    resetPassword,
} from "../../requests/auth/password.request.js";

describe("Recuperação de senha: concorrência", () => {
    test("deve criar uma recuperação e enviar um código em pedidos simultâneos para a mesma conta", async () => {
        const { user, payload } = await createRegisteredUser();
        const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

        const responses = await Promise.all([
            requestPasswordRecovery({ email: payload.email }),
            resendPasswordRecoveryCode({ email: payload.email }),
        ]);

        assert.deepEqual(
            responses.map((response) => response.status),
            [202, 202],
        );
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore + 1);
        assert.equal(await prisma.passwordRecovery.count({ where: { userId: user.id } }), 1);

        const recovery = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });

        assert.equal(recovery.sentCount, 1);
    });

    test("não deve confirmar, penalizar ou invalidar um código novo usando uma leitura antiga", async () => {
        const { payload, recovery } = await createPasswordRecovery();

        await prisma.passwordRecovery.update({
            where: { id: recovery.id },
            data: { lastCodeSentAt: new Date(0) },
        });

        const resend = await resendPasswordRecoveryCode({ email: payload.email });
        const tokenHash = hashPasswordResetToken(generatePasswordResetToken());

        assert.equal(resend.status, 202);

        const authorized = await authorizePasswordReset(recovery, tokenHash);
        const attempts = await incrementPasswordRecoveryAttempts(recovery);
        const invalidated = await invalidatePasswordRecoveryCode(recovery.id, recovery.codeHash!);

        assert.isFalse(authorized);
        assert.equal(attempts.count, 0);
        assert.equal(invalidated.count, 0);

        const active = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { id: recovery.id },
        });

        assert.exists(active.codeHash);
        assert.isNull(active.resetTokenHash);
        assert.equal(active.attempts, 0);
    });

    test("deve limitar atomicamente os erros a cinco e impedir autorização após atingir o limite", async () => {
        const { recovery } = await createPasswordRecovery();

        await Promise.all(
            Array.from({ length: 8 }, () => incrementPasswordRecoveryAttempts(recovery)),
        );

        const persisted = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { id: recovery.id },
        });
        const authorized = await authorizePasswordReset(
            recovery,
            hashPasswordResetToken(generatePasswordResetToken()),
        );

        assert.equal(persisted.attempts, 5);
        assert.isFalse(authorized);
    });

    test("não deve recriar uma sessão antiga quando refresh e redefinição ocorrerem juntos", async () => {
        const { user, payload, resetToken } = await createAuthorizedPasswordReset();

        await loginUser({ email: payload.email, password: payload.password });

        const session = await prisma.refreshSession.findFirstOrThrow({
            where: { userId: user.id },
        });
        const results = await Promise.allSettled([
            resetPassword({ resetToken, password: "senha recuperada" }),
            rotateRefreshSession(
                session.id,
                user.id,
                "hash-rotacionado",
                new Date(Date.now() + 600_000),
                0,
            ),
        ]);

        const reset = results[0]!;
        const rotation = results[1]!;

        assert.equal(reset.status, "fulfilled");

        if (reset.status === "fulfilled") {
            assert.equal(reset.value.status, 204);
        }

        if (rotation.status === "rejected") {
            assert.equal(rotation.reason.statusCode, 401);
        }

        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 0);

        await expect(
            createRefreshSession(user.id, "hash-login-antigo", new Date(Date.now() + 600_000), 0),
        ).rejects.toMatchObject({ statusCode: 401 });

        assert.equal(await prisma.refreshSession.count({ where: { userId: user.id } }), 0);
    });

    test("deve aceitar uma única troca pelo perfil para a mesma versão de sessão", async () => {
        const { user } = await createRegisteredUser();
        const passwordHash = await hashPassword("senha atualizada");

        const results = await Promise.allSettled([
            changePasswordAndRevokeSessions(user.id, 0, passwordHash),
            changePasswordAndRevokeSessions(user.id, 0, passwordHash),
        ]);

        assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);

        const rejected = results.find((result) => result.status === "rejected");

        assert.exists(rejected);
        assert.equal(rejected.reason.statusCode, 401);

        const persisted = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.equal(persisted.sessionVersion, 1);
        assert.equal(persisted.passwordHash, passwordHash);
    });
});
