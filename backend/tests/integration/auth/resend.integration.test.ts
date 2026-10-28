import { describe, test, assert, vi, afterEach } from "vitest";
import { randomUUID } from "node:crypto";

import { prisma } from "../../../src/lib/prisma.js";
import { sendEmail } from "../../../src/integrations/mail.js";
import { registerUser } from "../../requests/auth/register.request.js";
import { verifyVerificationCode } from "../../../src/lib/verificationCode.js";

import { getLastVerificationCode } from "../../helpers/http/verificationCode.helper.js";
import { makeRegisterUserPayload } from "../../factories/auth.factory.js";
import {
    resendRegistrationCode,
    verifyRegistration,
} from "../../requests/auth/verification.request.js";

describe("POST /auth/register/resend", () => {
    afterEach(() => vi.restoreAllMocks());

    test("deve respeitar o cooldown sem enviar outro e-mail", async () => {
        const registration = await registerUser(makeRegisterUserPayload());

        assert.equal(
            (
                await resendRegistrationCode({
                    pendingRegistrationId: registration.body.pendingRegistrationId,
                })
            ).status,
            429,
        );
        assert.equal(vi.mocked(sendEmail).mock.calls.length, 1);
    });

    test("deve renovar o código mantendo ID e prazo do cadastro e reiniciar tentativas", async () => {
        const registration = await registerUser(makeRegisterUserPayload());
        const id = registration.body.pendingRegistrationId;
        const expiresAt = new Date(Date.now() + 120_000);

        await prisma.pendingRegistration.update({
            where: { id },
            data: { lastCodeSentAt: new Date(Date.now() - 61_000), attempts: 5, expiresAt },
        });

        assert.equal((await resendRegistrationCode({ pendingRegistrationId: id })).status, 200);

        const pending = await prisma.pendingRegistration.findUniqueOrThrow({ where: { id } });

        assert.equal(pending.attempts, 0);
        assert.equal(pending.expiresAt.getTime(), expiresAt.getTime());
        assert.equal(pending.codeExpiresAt.getTime(), expiresAt.getTime());

        const code = getLastVerificationCode();

        assert.isTrue(await verifyVerificationCode(code, pending.codeHash));

        assert.equal((await verifyRegistration({ pendingRegistrationId: id, code })).status, 201);
    });

    test("deve rejeitar cadastro inexistente ou expirado", async () => {
        assert.equal(
            (await resendRegistrationCode({ pendingRegistrationId: randomUUID() })).status,
            400,
        );

        const registration = await registerUser(makeRegisterUserPayload());
        const id = registration.body.pendingRegistrationId;

        await prisma.pendingRegistration.update({
            where: { id },
            data: { expiresAt: new Date(0) },
        });

        assert.equal((await resendRegistrationCode({ pendingRegistrationId: id })).status, 400);
    });

    test("deve invalidar o código após falha SMTP no reenvio e permitir nova tentativa", async () => {
        const registration = await registerUser(makeRegisterUserPayload());
        const id = registration.body.pendingRegistrationId;

        await prisma.pendingRegistration.update({
            where: { id },
            data: { lastCodeSentAt: new Date(Date.now() - 61_000) },
        });

        vi.mocked(sendEmail).mockRejectedValueOnce(new Error("SMTP indisponível"));

        assert.equal((await resendRegistrationCode({ pendingRegistrationId: id })).status, 503);
        assert.equal(
            (
                await prisma.pendingRegistration.findUniqueOrThrow({ where: { id } })
            ).codeExpiresAt.getTime(),
            0,
        );

        assert.equal((await resendRegistrationCode({ pendingRegistrationId: id })).status, 200);
    });
});
