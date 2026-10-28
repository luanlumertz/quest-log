import { afterEach, describe, expect, test, vi } from "vitest";
import { sendEmail } from "../../../src/integrations/mail.js";
import { logger } from "../../../src/lib/logger.js";
import {
    savePasswordRecoveryCode,
    invalidatePasswordRecoveryCode,
} from "../../../src/repositories/passwordRecovery.repository.js";
import { sendPasswordRecoveryCode } from "../../../src/services/password.helpers.js";

vi.mock("../../../src/integrations/mail.js", () => ({ sendEmail: vi.fn() }));
vi.mock("../../../src/repositories/passwordRecovery.repository.js", () => ({
    savePasswordRecoveryCode: vi.fn(),
    invalidatePasswordRecoveryCode: vi.fn(),
}));

describe("sendPasswordRecoveryCode", () => {
    afterEach(() => {
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    test("deve preservar o erro de envio e registrar separadamente uma falha na invalidação", async () => {
        const now = new Date();
        vi.mocked(savePasswordRecoveryCode).mockResolvedValue({
            id: "id",
            userId: 1,
            email: "teste@email.com",
            codeHash: "hash",
            codeExpiresAt: now,
            attempts: 0,
            resetTokenHash: null,
            resetTokenExpiresAt: null,
            lastCodeSentAt: now,
            sendWindowStartedAt: now,
            sentCount: 1,
            expiresAt: now,
        });
        const deliveryError = new Error("SMTP indisponível");
        const cleanupError = new Error("Banco indisponível");
        vi.mocked(sendEmail).mockRejectedValue(deliveryError);
        vi.mocked(invalidatePasswordRecoveryCode).mockRejectedValue(cleanupError);
        const log = vi.spyOn(logger, "error").mockImplementation(() => {});

        await expect(sendPasswordRecoveryCode("teste@email.com")).rejects.toBe(deliveryError);

        expect(log).toHaveBeenCalledExactlyOnceWith(
            { event: "password.code_cleanup_failed", err: cleanupError },
            "Falha ao invalidar código de recuperação",
        );
    });
});
