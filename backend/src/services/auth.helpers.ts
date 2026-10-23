import { AppError } from "../errors/AppError.js";
import { sendEmail } from "../integrations/mail.js";
import { invalidatePendingCodeAfterEmailFailure } from "../repositories/pendingRegistration.repository.js";

type SendRegistrationVerificationEmailOptions = {
    pendingRegistrationId: string;
    codeHash: string;
    to: string;
    subject: string;
    text: string;
    logMessage: string;
    errorMessage: string;
};

export async function sendRegistrationVerificationEmail({
    pendingRegistrationId,
    codeHash,
    to,
    subject,
    text,
    logMessage,
    errorMessage,
}: SendRegistrationVerificationEmailOptions) {
    try {
        await sendEmail({ to, subject, text });
    } catch (error) {
        try {
            await invalidatePendingCodeAfterEmailFailure(pendingRegistrationId, codeHash);
        } catch (cleanupError) {
            console.error("Erro ao invalidar código após falha SMTP:", cleanupError);
        }

        console.error(logMessage, error);

        throw new AppError(errorMessage, 503);
    }
}
