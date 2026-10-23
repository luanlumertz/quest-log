import { AppError } from "../errors/AppError.js";
import { comparePassword, hashPassword } from "../lib/bcrypt.js";
import { generatePasswordResetToken, hashPasswordResetToken } from "../lib/passwordResetToken.js";
import {
    generateVerificationCode,
    hashVerificationCode,
    verifyVerificationCode,
} from "../lib/verificationCode.js";
import {
    MAX_VERIFICATION_ATTEMPTS,
    PASSWORD_RESET_TOKEN_EXPIRES_IN_MS,
} from "../constants/auth.js";
import {
    authorizePasswordReset,
    changePasswordAndRevokeSessions,
    findPasswordRecoveryByEmail,
    incrementPasswordRecoveryAttempts,
    resetPasswordWithToken,
} from "../repositories/passwordRecovery.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import type {
    ChangePasswordData,
    RequestPasswordRecoveryData,
    ResetPasswordData,
    VerifyPasswordRecoveryData,
} from "../schemas/auth.schema.js";
import { sendPasswordChangedNotification, sendPasswordRecoveryCode } from "./password.helpers.js";

const dummyCodeHash = hashVerificationCode(generateVerificationCode());
const pendingRecoveryEmails = new Set<Promise<void>>();

export function requestPasswordRecovery(data: RequestPasswordRecoveryData) {
    // O HTTP não espera consulta à conta nem SMTP, evitando revelar sua existência pelo tempo.
    // O limite por IP é aplicado antes de agendar este trabalho.
    const task = new Promise<void>((resolve) => {
        setImmediate(resolve);
    })
        .then(() => sendPasswordRecoveryCode(data.email))
        .catch((error: unknown) => {
            console.error("Erro ao processar recuperação de senha:", error);
        });

    pendingRecoveryEmails.add(task);
    void task.finally(() => pendingRecoveryEmails.delete(task));

    return {
        message:
            "Se houver uma conta com este e-mail, enviaremos um código de recuperação. Aguarde 60 segundos antes de solicitar outro.",
    };
}

export async function waitForPasswordRecoveryEmails() {
    await Promise.all(pendingRecoveryEmails);
}

export async function verifyPasswordRecovery(data: VerifyPasswordRecoveryData) {
    const recovery = await findPasswordRecoveryByEmail(data.email);

    // Mesmo custo de comparação para conta inexistente, código consumido ou tentativa ativa.
    const valid = await verifyVerificationCode(
        data.code,
        recovery?.codeHash ?? (await dummyCodeHash),
    );

    if (
        !recovery?.codeHash ||
        recovery.codeExpiresAt <= new Date() ||
        recovery.attempts >= MAX_VERIFICATION_ATTEMPTS
    ) {
        throw new AppError("Código inválido ou expirado.", 400);
    }

    if (!valid) {
        await incrementPasswordRecoveryAttempts(recovery);
        throw new AppError("Código inválido ou expirado.", 400);
    }

    const resetToken = generatePasswordResetToken();
    const authorized = await authorizePasswordReset(recovery, hashPasswordResetToken(resetToken));

    if (!authorized) {
        throw new AppError("Código inválido ou expirado.", 400);
    }

    return { resetToken, expiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN_MS / 1000 };
}

export async function resetPassword(data: ResetPasswordData) {
    const passwordHash = await hashPassword(data.password);
    const user = await resetPasswordWithToken(
        hashPasswordResetToken(data.resetToken),
        passwordHash,
    );

    if (!user) {
        throw new AppError("Autorização inválida ou expirada. Solicite um novo código.", 400);
    }

    await sendPasswordChangedNotification(user.email);
}

export async function changePassword(userId: number, data: ChangePasswordData) {
    const user = await findUserById(userId);

    if (!user) {
        throw new AppError("Não autenticado", 401);
    }

    const valid = await comparePassword(data.currentPassword, user.passwordHash);

    if (!valid) {
        throw new AppError("Senha atual incorreta.", 400);
    }

    const passwordHash = await hashPassword(data.password);
    const updated = await changePasswordAndRevokeSessions(
        user.id,
        user.sessionVersion,
        passwordHash,
    );

    await sendPasswordChangedNotification(updated.email);
}
