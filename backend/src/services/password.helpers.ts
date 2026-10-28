import { renderEmailTemplate } from "../templates/email.template.js";
import { sendEmail } from "../integrations/mail.js";
import { logger } from "../lib/logger.js";
import { generateVerificationCode, hashVerificationCode } from "../lib/verificationCode.js";
import {
    invalidatePasswordRecoveryCode,
    savePasswordRecoveryCode,
} from "../repositories/passwordRecovery.repository.js";

export async function sendPasswordRecoveryCode(email: string) {
    const code = generateVerificationCode();
    const codeHash = await hashVerificationCode(code);
    const recovery = await savePasswordRecoveryCode(email, codeHash);

    // Conta inexistente, cooldown e limite por conta têm a mesma resposta pública.
    if (!recovery) return;

    try {
        await sendEmail({
            to: recovery.email,
            html: renderEmailTemplate({
                category: "RECUPERAÇÃO DE SENHA",
                title: "Recupere sua senha.",
                description:
                    "Digite o código abaixo na tela de verificação. Depois, você poderá escolher uma nova senha para sua conta no QuestLog.",
                footer: "Se você não fez esta solicitação, ignore este e-mail. Sua senha permanece a mesma.",
                code,
            }),
            subject: "Recuperação de senha - QuestLog",
            text: `Seu código para recuperar a senha é ${code}. Ele é válido por 10 minutos. Se você não fez esta solicitação, ignore este e-mail. Sua senha permanece a mesma.`,
        });
    } catch (error) {
        try {
            await invalidatePasswordRecoveryCode(recovery.id, codeHash);
        } catch (cleanupError) {
            logger.error(
                { event: "password.code_cleanup_failed", err: cleanupError },
                "Falha ao invalidar código de recuperação",
            );
        }
        throw error;
    }
}

export async function sendPasswordChangedNotification(
    email: string,
    { currentSessionRenewed = false }: { currentSessionRenewed?: boolean } = {},
) {
    const sessionMessage = currentSessionRenewed
        ? "As outras sessões foram encerradas. Você continua conectado no navegador em que alterou a senha."
        : "Todas as sessões foram encerradas.";

    try {
        await sendEmail({
            to: email,
            html: renderEmailTemplate({
                category: "SEGURANÇA DA CONTA",
                title: "Sua senha foi alterada.",
                description: `A senha da sua conta no QuestLog foi alterada. ${sessionMessage}`,
                footer: "Se você não fez esta alteração, recupere sua senha e verifique a segurança do seu e-mail.",
            }),
            subject: "Sua senha foi alterada - QuestLog",
            text: `A senha da sua conta no QuestLog foi alterada. ${sessionMessage} Se você não fez esta alteração, recupere sua senha e verifique a segurança do seu e-mail.`,
        });
    } catch (error) {
        // A senha já foi alterada; uma falha no aviso não deve aparentar desfazer a operação.
        logger.error(
            { event: "password.notification_failed", err: error },
            "Falha no aviso de alteração de senha",
        );
    }
}
