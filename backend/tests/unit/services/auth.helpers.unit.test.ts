import { logger } from "../../../src/lib/logger.js";
import { describe, test, assert, expect, vi, afterEach } from "vitest";

import { sendEmail } from "../../../src/integrations/mail.js";
import { invalidatePendingCodeAfterEmailFailure } from "../../../src/repositories/pendingRegistration.repository.js";
import { sendRegistrationVerificationEmail } from "../../../src/services/auth.helpers.js";

vi.mock("../../../src/integrations/mail.js", () => ({ sendEmail: vi.fn() }));
vi.mock("../../../src/repositories/pendingRegistration.repository.js", () => ({
    invalidatePendingCodeAfterEmailFailure: vi.fn(),
}));

describe("sendRegistrationVerificationEmail", () => {
    afterEach(() => {
        vi.resetAllMocks();
        vi.restoreAllMocks();
    });

    test("deve manter o erro 503 mesmo se a invalidação também falhar", async () => {
        const smtpError = new Error("SMTP indisponível");
        const cleanupError = new Error("Banco indisponível");

        vi.mocked(sendEmail).mockRejectedValue(smtpError);
        vi.mocked(invalidatePendingCodeAfterEmailFailure).mockRejectedValue(cleanupError);
        const log = vi.spyOn(logger, "error").mockImplementation(() => {});

        await expect(
            sendRegistrationVerificationEmail({
                pendingRegistrationId: "id-antigo",
                codeHash: "hash-antigo",
                to: "teste@email.com",
                subject: "Código",
                text: "123456",
                code: "123456",
                errorMessage: "Tente novamente.",
            }),
        ).rejects.toMatchObject({ statusCode: 503, message: "Tente novamente.", cause: smtpError });

        expect(invalidatePendingCodeAfterEmailFailure).toHaveBeenCalledWith(
            "id-antigo",
            "hash-antigo",
        );

        assert.equal(log.mock.calls.length, 1);
        expect(log).toHaveBeenCalledWith(
            { event: "registration.code_cleanup_failed", err: cleanupError },
            "Falha ao invalidar código de cadastro",
        );
    });
});
