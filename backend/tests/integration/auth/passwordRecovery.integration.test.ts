import { logger } from "../../../src/lib/logger.js";
import { assert, describe, test, vi, afterEach } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { sendEmail } from "../../../src/integrations/mail.js";
import * as verificationCode from "../../../src/lib/verificationCode.js";

import { createRegisteredUser } from "../../fixtures/auth.fixture.js";
import {
    createAuthorizedPasswordReset,
    createPasswordRecovery,
} from "../../fixtures/password.fixture.js";
import { getLastVerificationCode } from "../../helpers/http/verificationCode.helper.js";
import {
    requestPasswordRecovery,
    resendPasswordRecoveryCode,
    resetPassword,
    verifyPasswordRecovery,
} from "../../requests/auth/password.request.js";

describe("Solicitação e reenvio de recuperação de senha", () => {
    afterEach(() => vi.restoreAllMocks());

    test("deve normalizar o e-mail e armazenar somente o hash de um código válido por dez minutos", async () => {
        const { user, payload } = await createRegisteredUser();
        const userBefore = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
        const before = Date.now();

        const response = await requestPasswordRecovery({
            email: `  ${payload.email.toUpperCase()}  `,
        });

        assert.equal(response.status, 202);
        assert.sameMembers(Object.keys(response.body), ["message"]);

        const recovery = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });
        const code = getLastVerificationCode();

        assert.match(code, /^\d{6}$/);
        assert.notEqual(recovery.codeHash, code);
        assert.isTrue(await verificationCode.verifyVerificationCode(code, recovery.codeHash!));
        assert.isAtLeast(recovery.codeExpiresAt.getTime(), before + 600_000);
        assert.isAtMost(recovery.codeExpiresAt.getTime(), Date.now() + 600_000);
        assert.equal(recovery.attempts, 0);
        assert.equal(recovery.sentCount, 1);
        assert.isNull(recovery.resetTokenHash);

        const userAfter = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

        assert.equal(userAfter.passwordHash, userBefore.passwordHash);
        assert.equal(userAfter.sessionVersion, userBefore.sessionVersion);
    });

    test("deve responder igualmente para conta existente e inexistente sem criar recuperação falsa", async () => {
        const { payload } = await createRegisteredUser();
        const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

        const existing = await requestPasswordRecovery({ email: payload.email });
        const missing = await requestPasswordRecovery({ email: "inexistente@email.com" });

        assert.equal(existing.status, 202);
        assert.equal(missing.status, 202);
        assert.deepEqual(missing.body, existing.body);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore + 1);
        assert.equal(await prisma.passwordRecovery.count(), 1);
        assert.equal(await prisma.user.count(), 1);
    });

    test("deve compartilhar o cooldown entre solicitar e reenviar sem renovar o código", async () => {
        const { payload, recovery } = await createPasswordRecovery();
        const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

        const forgot = await requestPasswordRecovery({ email: payload.email });
        const resend = await resendPasswordRecoveryCode({ email: payload.email });

        assert.equal(forgot.status, 202);
        assert.equal(resend.status, 202);
        assert.deepEqual(resend.body, forgot.body);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore);

        const persisted = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { id: recovery.id },
        });

        assert.equal(persisted.codeHash, recovery.codeHash);
        assert.equal(persisted.lastCodeSentAt.getTime(), recovery.lastCodeSentAt.getTime());
        assert.equal(persisted.sentCount, 1);
    });

    test("deve reenviar após 60 segundos, reiniciar tentativas e rejeitar o código anterior", async () => {
        const { payload, recovery, code } = await createPasswordRecovery();

        await prisma.passwordRecovery.update({
            where: { id: recovery.id },
            data: { lastCodeSentAt: new Date(Date.now() - 61_000), attempts: 5 },
        });

        vi.spyOn(verificationCode, "generateVerificationCode").mockReturnValue(
            code === "012345" ? "654321" : "012345",
        );

        const response = await resendPasswordRecoveryCode({ email: payload.email });

        assert.equal(response.status, 202);

        const persisted = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { id: recovery.id },
        });
        const newCode = getLastVerificationCode();

        assert.equal(persisted.attempts, 0);
        assert.equal(persisted.sentCount, 2);
        assert.notEqual(persisted.codeHash, recovery.codeHash);
        assert.equal(
            persisted.sendWindowStartedAt.getTime(),
            recovery.sendWindowStartedAt.getTime(),
        );

        const oldVerification = await verifyPasswordRecovery({ email: payload.email, code });
        const newVerification = await verifyPasswordRecovery({
            email: payload.email,
            code: newCode,
        });

        assert.equal(oldVerification.status, 400);
        assert.equal(newVerification.status, 200);
    });

    test("deve invalidar a autorização anterior ao enviar um novo código", async () => {
        const { payload, recovery, resetToken } = await createAuthorizedPasswordReset();

        await prisma.passwordRecovery.update({
            where: { id: recovery.id },
            data: { lastCodeSentAt: new Date(Date.now() - 61_000) },
        });

        const resend = await resendPasswordRecoveryCode({ email: payload.email });
        const reset = await resetPassword({ resetToken, password: "nova senha" });

        assert.equal(resend.status, 202);
        assert.equal(reset.status, 400);

        const persisted = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { id: recovery.id },
        });

        assert.isNull(persisted.resetTokenHash);
        assert.isNull(persisted.resetTokenExpiresAt);
        assert.exists(persisted.codeHash);
    });

    test("deve preservar o limite por conta e permitir novo envio quando a janela terminar", async () => {
        const { user, payload, recovery } = await createPasswordRecovery();
        const emailsBefore = vi.mocked(sendEmail).mock.calls.length;

        await prisma.passwordRecovery.update({
            where: { id: recovery.id },
            data: { sentCount: 10, lastCodeSentAt: new Date(0) },
        });

        const blocked = await requestPasswordRecovery({ email: payload.email });

        assert.equal(blocked.status, 202);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore);

        await prisma.passwordRecovery.update({
            where: { id: recovery.id },
            data: { sendWindowStartedAt: new Date(Date.now() - 3_601_000) },
        });

        const allowed = await resendPasswordRecoveryCode({ email: payload.email });
        const persisted = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });

        assert.equal(allowed.status, 202);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, emailsBefore + 1);
        assert.equal(persisted.sentCount, 1);
        assert.isAbove(
            persisted.sendWindowStartedAt.getTime(),
            recovery.sendWindowStartedAt.getTime(),
        );
        assert.isAtLeast(
            persisted.expiresAt.getTime(),
            persisted.sendWindowStartedAt.getTime() + 3_600_000,
        );
    });

    test("deve manter a resposta genérica após falha SMTP, invalidar o código e liberar outra tentativa", async () => {
        const { user, payload } = await createRegisteredUser();
        const log = vi.spyOn(logger, "error").mockImplementation(() => {});

        vi.mocked(sendEmail).mockRejectedValueOnce(new Error("SMTP indisponível"));

        const failed = await requestPasswordRecovery({ email: payload.email });
        const undeliveredCode = getLastVerificationCode();
        const recovery = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });

        assert.equal(failed.status, 202);
        assert.isNull(recovery.codeHash);
        assert.equal(recovery.codeExpiresAt.getTime(), 0);
        assert.equal(recovery.lastCodeSentAt.getTime(), 0);
        assert.equal(log.mock.calls.length, 1);

        const verification = await verifyPasswordRecovery({
            email: payload.email,
            code: undeliveredCode,
        });
        const retry = await requestPasswordRecovery({ email: payload.email });

        assert.equal(verification.status, 400);
        assert.equal(retry.status, 202);
        assert.deepEqual(retry.body, failed.body);

        const active = await prisma.passwordRecovery.findUniqueOrThrow({
            where: { userId: user.id },
        });

        assert.exists(active.codeHash);
        assert.isTrue(
            await verificationCode.verifyVerificationCode(
                getLastVerificationCode(),
                active.codeHash!,
            ),
        );
    });
});
