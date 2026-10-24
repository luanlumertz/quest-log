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
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        await expect(
            sendRegistrationVerificationEmail({
                pendingRegistrationId: "id-antigo",
                codeHash: "hash-antigo",
                to: "teste@email.com",
                subject: "Código",
                text: "123456",
                code: "123456",
                logMessage: "Falha no envio:",
                errorMessage: "Tente novamente.",
            }),
        ).rejects.toMatchObject({ statusCode: 503, message: "Tente novamente." });

        expect(invalidatePendingCodeAfterEmailFailure).toHaveBeenCalledWith(
            "id-antigo",
            "hash-antigo",
        );

        assert.equal(log.mock.calls.length, 2);
    });
});
