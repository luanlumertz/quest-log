import { sendEmail } from "../integrations/mail.js";
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
            subject: "Recuperação de senha - QuestLog",
            text: `Seu código para recuperar a senha é ${code}. Ele é válido por 10 minutos. Se você não fez esta solicitação, ignore este e-mail. Sua senha permanece a mesma.`,
        });
    } catch (error) {
        await invalidatePasswordRecoveryCode(recovery.id, codeHash);
        throw error;
    }
}

export async function sendPasswordChangedNotification(email: string) {
    try {
        await sendEmail({
            to: email,
            subject: "Sua senha foi alterada - QuestLog",
            text: "A senha da sua conta no QuestLog foi alterada. Todas as sessões foram encerradas. Se você não fez esta alteração, recupere sua senha e verifique a segurança do seu e-mail.",
        });
    } catch (error) {
        // A senha já foi alterada; uma falha no aviso não deve aparentar desfazer a operação.
        console.error("Erro ao enviar aviso de alteração de senha:", error);
    }
}
