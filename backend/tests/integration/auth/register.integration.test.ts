import { describe, test, assert, expect, vi, afterEach } from "vitest";
import bcrypt from "bcryptjs";

import { prisma } from "../../../src/lib/prisma.js";
import { sendEmail } from "../../../src/integrations/mail.js";
import { savePendingRegistration } from "../../../src/repositories/pendingRegistration.repository.js";
import * as verificationCode from "../../../src/lib/verificationCode.js";

import { getLastVerificationCode } from "../../helpers/http/verificationCode.helper.js";
import { createRegisteredUser } from "../../fixtures/auth.fixture.js";
import { makeRegisterUserPayload } from "../../factories/auth.factory.js";
import { registerUser } from "../../requests/auth/register.request.js";
import { verifyRegistration } from "../../requests/auth/verification.request.js";

describe("POST /auth/register", () => {
    afterEach(() => vi.restoreAllMocks());

    test("deve criar somente uma pendência e enviar o código sem expor hashes", async () => {
        const payload = makeRegisterUserPayload();

        const response = await registerUser(payload);

        assert.equal(response.status, 202);
        assert.sameMembers(Object.keys(response.body), ["pendingRegistrationId", "email"]);
        assert.equal(response.body.email, payload.email);
        assert.equal(await prisma.user.count(), 0);

        const pending = await prisma.pendingRegistration.findUniqueOrThrow({
            where: { email: payload.email },
        });

        assert.equal(pending.id, response.body.pendingRegistrationId);
        assert.equal(pending.name, payload.name);

        assert.isTrue(await bcrypt.compare(payload.password, pending.passwordHash));
        assert.isTrue(await bcrypt.compare(getLastVerificationCode(), pending.codeHash));

        assert.closeTo(
            pending.codeExpiresAt.getTime() - pending.createdAt.getTime(),
            600_000,
            2000,
        );
        assert.closeTo(pending.expiresAt.getTime() - pending.createdAt.getTime(), 1_800_000, 2000);
    });

    test("deve substituir a tentativa mesmo sem mudanças e invalidar o ID anterior", async () => {
        vi.spyOn(verificationCode, "generateVerificationCode")
            .mockReturnValueOnce("111111")
            .mockReturnValueOnce("222222");

        const payload = makeRegisterUserPayload();

        const first = await registerUser(payload);
        const firstCode = getLastVerificationCode();

        const second = await registerUser(payload);

        assert.equal(second.status, 202);
        assert.notEqual(first.body.pendingRegistrationId, second.body.pendingRegistrationId);
        assert.equal(await prisma.pendingRegistration.count(), 1);
        assert.equal(
            (
                await verifyRegistration({
                    pendingRegistrationId: first.body.pendingRegistrationId,
                    code: firstCode,
                })
            ).status,
            400,
        );
        assert.equal(await prisma.user.count(), 0);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, 2);

        const oldCodeWithNewId = await verifyRegistration({
            pendingRegistrationId: second.body.pendingRegistrationId,
            code: firstCode,
        });

        assert.equal(oldCodeWithNewId.status, 400);
    });

    test("deve usar os dados mais recentes e reiniciar tentativas e prazos", async () => {
        const payload = makeRegisterUserPayload();

        const first = await registerUser(payload);

        await prisma.pendingRegistration.update({
            where: { id: first.body.pendingRegistrationId },
            data: { attempts: 5, codeExpiresAt: new Date(0), expiresAt: new Date(0) },
        });

        const updated = { ...payload, name: "Novo Nome", password: "novaSenha123" };

        const second = await registerUser(updated);

        assert.equal(second.status, 202);

        const pending = await prisma.pendingRegistration.findUniqueOrThrow({
            where: { email: payload.email },
        });

        assert.equal(pending.attempts, 0);
        assert.isAbove(pending.expiresAt.getTime(), Date.now());
        assert.equal(
            (
                await verifyRegistration({
                    pendingRegistrationId: second.body.pendingRegistrationId,
                    code: getLastVerificationCode(),
                })
            ).status,
            201,
        );

        const user = await prisma.user.findUniqueOrThrow({ where: { email: payload.email } });

        assert.equal(user.name, updated.name);
        assert.isTrue(await bcrypt.compare(updated.password, user.passwordHash));
    });

    test("deve manter pendências independentes para e-mails diferentes", async () => {
        await registerUser(makeRegisterUserPayload());

        assert.equal(
            (await registerUser(makeRegisterUserPayload({ email: "outro@email.com" }))).status,
            202,
        );
        assert.equal(await prisma.pendingRegistration.count(), 2);
    });

    test("não deve cadastrar e-mail de usuário definitivo", async () => {
        const { payload } = await createRegisteredUser();

        const response = await registerUser(payload);

        assert.equal(response.status, 409);
        assert.equal(response.body.message, "Este e-mail já está em uso");

        assert.equal(await prisma.user.count(), 1);
        assert.equal(await prisma.pendingRegistration.count(), 0);
    });

    test("não deve cadastrar com payload inválido", async () => {
        assert.equal(
            (await registerUser(makeRegisterUserPayload({ email: "invalido" }))).status,
            422,
        );
        assert.equal(await prisma.pendingRegistration.count(), 0);
        assert.equal(vi.mocked(sendEmail).mock.calls.length, 0);
    });

    test("deve invalidar o código após falha SMTP e permitir nova tentativa", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(sendEmail).mockRejectedValueOnce(new Error("SMTP indisponível"));

        const payload = makeRegisterUserPayload();

        assert.equal((await registerUser(payload)).status, 503);

        const failed = await prisma.pendingRegistration.findUniqueOrThrow({
            where: { email: payload.email },
        });

        assert.equal(failed.codeExpiresAt.getTime(), 0);

        const retried = await registerUser(payload);

        assert.equal(retried.status, 202);
        assert.notEqual(retried.body.pendingRegistrationId, failed.id);
    });

    test("deve manter uma única tentativa em cadastros simultâneos", async () => {
        const payload = makeRegisterUserPayload();

        const responses = await Promise.all([
            registerUser(payload),
            registerUser({ ...payload, name: "Outro Nome" }),
        ]);

        assert.isTrue(responses.every((response) => response.status === 202));
        assert.notEqual(
            responses[0]!.body.pendingRegistrationId,
            responses[1]!.body.pendingRegistrationId,
        );
        assert.equal(await prisma.pendingRegistration.count(), 1);
    });

    test("deve revalidar o e-mail dentro da transação se a conta já foi confirmada", async () => {
        const { payload } = await createRegisteredUser();

        await expect(
            savePendingRegistration({
                name: payload.name,
                email: payload.email,
                passwordHash: "hash",
                codeHash: "hash",
                codeExpiresAt: new Date(Date.now() + 600_000),
                expiresAt: new Date(Date.now() + 1_800_000),
            }),
        ).rejects.toMatchObject({ statusCode: 409, message: "Este e-mail já está em uso" });

        assert.equal(await prisma.pendingRegistration.count(), 0);
    });

    test("uma falha SMTP atrasada não deve invalidar a tentativa mais recente", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        let rejectEmail!: (error: Error) => void;
        let notifySending!: () => void;
        const sending = new Promise<void>((resolve) => {
            notifySending = resolve;
        });

        vi.mocked(sendEmail).mockImplementationOnce(
            () =>
                new Promise<void>((_resolve, reject) => {
                    rejectEmail = reject;
                    notifySending();
                }),
        );

        const payload = makeRegisterUserPayload();
        const firstRequest = registerUser(payload).then((response) => response);
        await sending;

        const second = await registerUser(payload);
        const code = getLastVerificationCode();

        rejectEmail(new Error("Falha atrasada"));

        assert.equal((await firstRequest).status, 503);
        assert.equal(second.status, 202);

        const verified = await verifyRegistration({
            pendingRegistrationId: second.body.pendingRegistrationId,
            code,
        });

        assert.equal(verified.status, 201);
    });
});
