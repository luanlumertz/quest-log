import { renderEmailTemplate } from "../templates/email.template.js";
import { AppError } from "../errors/AppError.js";
import { sendEmail } from "../integrations/mail.js";
import { invalidatePendingCodeAfterEmailFailure } from "../repositories/pendingRegistration.repository.js";

type SendRegistrationVerificationEmailOptions = {
    pendingRegistrationId: string;
    codeHash: string;
    to: string;
    subject: string;
    text: string;
    code: string;
    validity?: string;
    logMessage: string;
    errorMessage: string;
};

export async function sendRegistrationVerificationEmail({
    pendingRegistrationId,
    codeHash,
    to,
    subject,
    text,
    code,
    validity,
    logMessage,
    errorMessage,
}: SendRegistrationVerificationEmailOptions) {
    try {
        await sendEmail({
            to,
            subject,
            text,
            html: renderEmailTemplate({
                category: "VERIFICAÇÃO DE E-MAIL",
                title: "Confirme seu e-mail.",
                description:
                    "Sua biblioteca está quase pronta. Digite o código abaixo na tela de verificação para concluir seu cadastro no QuestLog.",
                footer: "Se você não criou uma conta no QuestLog, pode ignorar este e-mail.",
                code,
                ...(validity ? { validity } : {}),
            }),
        });
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
