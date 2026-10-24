import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import type { PendingRegistration } from "../../../src/generated/prisma/client.js";
import { Prisma } from "../../../src/generated/prisma/client.js";

import * as repository from "../../../src/repositories/pendingRegistration.repository.js";
import * as verificationCode from "../../../src/lib/verificationCode.js";
import { verifyRegistration, resendRegistrationCode } from "../../../src/services/auth.service.js";

describe("Autenticação: alterações concorrentes durante a verificação", () => {
    const pending: PendingRegistration = {
        id: "id-pendente",
        name: "Teste",
        email: "teste@email.com",
        passwordHash: "hash",
        codeHash: "hash",
        attempts: 0,
        createdAt: new Date(),
        lastCodeSentAt: new Date(0),
        expiresAt: new Date(Date.now() + 1_800_000),
        codeExpiresAt: new Date(Date.now() + 600_000),
    };

    beforeEach(() => {
        vi.spyOn(repository, "findPendingRegistrationById").mockResolvedValue(pending);
        vi.spyOn(verificationCode, "verifyVerificationCode").mockResolvedValue(true);
    });

    afterEach(() => vi.restoreAllMocks());

    test("deve rejeitar confirmação se a tentativa foi substituída após a leitura", async () => {
        vi.spyOn(repository, "completePendingRegistration").mockResolvedValue(null);

        await expect(
            verifyRegistration({ pendingRegistrationId: pending.id, code: "123456" }),
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("deve traduzir a disputa pelo e-mail para 409", async () => {
        vi.spyOn(repository, "completePendingRegistration").mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError("Duplicado", {
                code: "P2002",
                clientVersion: "6.17.1",
            }),
        );

        await expect(
            verifyRegistration({ pendingRegistrationId: pending.id, code: "123456" }),
        ).rejects.toMatchObject({ statusCode: 409 });
    });

    test("deve propagar falhas inesperadas na confirmação", async () => {
        const error = new Error("Banco indisponível");

        vi.spyOn(repository, "completePendingRegistration").mockRejectedValue(error);

        await expect(
            verifyRegistration({ pendingRegistrationId: pending.id, code: "123456" }),
        ).rejects.toBe(error);
    });

    test("não deve enviar código se outra requisição já renovou a tentativa", async () => {
        vi.spyOn(repository, "updatePendingRegistrationCode").mockResolvedValue({ count: 0 });

        await expect(
            resendRegistrationCode({ pendingRegistrationId: pending.id }),
        ).rejects.toMatchObject({ statusCode: 429 });
    });
});
