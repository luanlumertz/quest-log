import { assert, describe, test, expect, vi, afterEach } from "vitest";
import type { PasswordRecovery } from "../../../src/generated/prisma/client.js";

import { sendPasswordRecoveryCode } from "../../../src/services/password.helpers.js";
import * as repository from "../../../src/repositories/passwordRecovery.repository.js";
import * as verificationCode from "../../../src/lib/verificationCode.js";
import {
    requestPasswordRecovery,
    verifyPasswordRecovery,
    waitForPasswordRecoveryEmails,
} from "../../../src/services/password.service.js";

vi.mock("../../../src/services/password.helpers.js", () => ({
    sendPasswordRecoveryCode: vi.fn(),
    sendPasswordChangedNotification: vi.fn(),
}));

describe("Recuperação de senha em segundo plano", () => {
    afterEach(async () => {
        await waitForPasswordRecoveryEmails();

        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    test("deve responder sem aguardar SMTP e permitir aguardar os envios antes de encerrar o servidor", async () => {
        let finishDelivery = () => {};
        let finishedWaiting = false;
        const delivery = new Promise<void>((resolve) => {
            finishDelivery = resolve;
        });

        vi.mocked(sendPasswordRecoveryCode).mockReturnValueOnce(delivery);

        try {
            const result = requestPasswordRecovery({ email: "teste@email.com" });
            const pending = waitForPasswordRecoveryEmails().then(() => {
                finishedWaiting = true;
            });

            assert.isString(result.message);

            await new Promise<void>((resolve) => {
                setImmediate(resolve);
            });

            expect(sendPasswordRecoveryCode).toHaveBeenCalledWith("teste@email.com");
            assert.isFalse(finishedWaiting);

            finishDelivery();

            await pending;

            assert.isTrue(finishedWaiting);
        } finally {
            finishDelivery();

            await waitForPasswordRecoveryEmails();
        }
    });

    test("deve registrar falha do processamento sem propagar rejeição nem expor detalhes na resposta", async () => {
        const error = new Error("Banco indisponível");
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(sendPasswordRecoveryCode).mockRejectedValueOnce(error);

        const result = requestPasswordRecovery({ email: "teste@email.com" });

        await waitForPasswordRecoveryEmails();

        assert.sameMembers(Object.keys(result), ["message"]);
        assert.include(result.message, "Se houver uma conta");
        assert.notInclude(result.message, error.message);
        expect(log).toHaveBeenCalledWith("Erro ao processar recuperação de senha:", error);
    });

    test("não deve devolver autorização se o código for invalidado entre a comparação e seu consumo", async () => {
        const recovery: PasswordRecovery = {
            id: "recuperacao",
            userId: 1,
            codeHash: "hash-codigo",
            codeExpiresAt: new Date(Date.now() + 600_000),
            attempts: 0,
            resetTokenHash: null,
            resetTokenExpiresAt: null,
            lastCodeSentAt: new Date(),
            sendWindowStartedAt: new Date(),
            sentCount: 1,
            expiresAt: new Date(Date.now() + 3_600_000),
        };

        vi.spyOn(repository, "findPasswordRecoveryByEmail").mockResolvedValue(recovery);
        vi.spyOn(verificationCode, "verifyVerificationCode").mockResolvedValue(true);
        vi.spyOn(repository, "authorizePasswordReset").mockResolvedValue(false);

        await expect(
            verifyPasswordRecovery({ email: "teste@email.com", code: "123456" }),
        ).rejects.toMatchObject({ statusCode: 400, message: "Código inválido ou expirado." });
    });
});
