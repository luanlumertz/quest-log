import type { PasswordRecovery, Prisma } from "@prisma/client";
import {
    MAX_PASSWORD_RECOVERY_EMAILS_PER_WINDOW,
    MAX_VERIFICATION_ATTEMPTS,
    PASSWORD_RECOVERY_SEND_WINDOW_MS,
    PASSWORD_RESET_TOKEN_EXPIRES_IN_MS,
    VERIFICATION_CODE_EXPIRES_IN_MS,
    VERIFICATION_RESEND_COOLDOWN_MS,
} from "../constants/auth.js";
import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";
import { lockUserForSession, runSessionTransaction } from "./session.repository.js";

export function savePasswordRecoveryCode(email: string, codeHash: string) {
    return runSessionTransaction(async (tx) => {
        // O bloqueio também serializa pedidos simultâneos para a mesma conta.
        const users = await tx.$queryRaw<{ id: number; email: string }[]>`
            SELECT "id", "email" FROM "User" WHERE "email" = ${email} FOR UPDATE
        `;
        const user = users[0];

        if (!user) return null;

        const previous = await tx.passwordRecovery.findUnique({ where: { userId: user.id } });
        const now = new Date();
        const windowActive =
            previous &&
            now.getTime() - previous.sendWindowStartedAt.getTime() <
                PASSWORD_RECOVERY_SEND_WINDOW_MS;

        if (
            previous &&
            (now.getTime() - previous.lastCodeSentAt.getTime() < VERIFICATION_RESEND_COOLDOWN_MS ||
                (windowActive && previous.sentCount >= MAX_PASSWORD_RECOVERY_EMAILS_PER_WINDOW))
        ) {
            return null;
        }

        const sendWindowStartedAt = windowActive ? previous.sendWindowStartedAt : now;
        const codeExpiresAt = new Date(now.getTime() + VERIFICATION_CODE_EXPIRES_IN_MS);
        const data = {
            codeHash,
            codeExpiresAt,
            attempts: 0,
            resetTokenHash: null,
            resetTokenExpiresAt: null,
            lastCodeSentAt: now,
            sendWindowStartedAt,
            sentCount: windowActive ? previous.sentCount + 1 : 1,
            // A limpeza não pode apagar o contador antes de terminar a janela por conta.
            expiresAt: new Date(
                Math.max(
                    codeExpiresAt.getTime(),
                    sendWindowStartedAt.getTime() + PASSWORD_RECOVERY_SEND_WINDOW_MS,
                ),
            ),
        };

        const recovery = await tx.passwordRecovery.upsert({
            where: { userId: user.id },
            create: { userId: user.id, ...data },
            update: data,
        });

        return { ...recovery, email: user.email };
    });
}

export function findPasswordRecoveryByEmail(email: string) {
    return prisma.passwordRecovery.findFirst({ where: { user: { email } } });
}

export function incrementPasswordRecoveryAttempts(recovery: PasswordRecovery) {
    return prisma.passwordRecovery.updateMany({
        where: {
            id: recovery.id,
            codeHash: recovery.codeHash,
            codeExpiresAt: { gt: new Date() },
            attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
        },
        data: { attempts: { increment: 1 } },
    });
}

export async function authorizePasswordReset(recovery: PasswordRecovery, resetTokenHash: string) {
    const now = new Date();
    const resetTokenExpiresAt = new Date(now.getTime() + PASSWORD_RESET_TOKEN_EXPIRES_IN_MS);

    const result = await prisma.passwordRecovery.updateMany({
        where: {
            id: recovery.id,
            codeHash: recovery.codeHash,
            codeExpiresAt: { gt: now },
            attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
        },
        data: {
            codeHash: null,
            codeExpiresAt: now,
            resetTokenHash,
            resetTokenExpiresAt,
            expiresAt: new Date(
                Math.max(recovery.expiresAt.getTime(), resetTokenExpiresAt.getTime()),
            ),
        },
    });

    return result.count === 1;
}

export function invalidatePasswordRecoveryCode(id: string, codeHash: string) {
    return prisma.passwordRecovery.updateMany({
        where: { id, codeHash },
        data: { codeHash: null, codeExpiresAt: new Date(0), lastCodeSentAt: new Date(0) },
    });
}

async function updatePasswordAndRevokeSessions(
    tx: Prisma.TransactionClient,
    userId: number,
    passwordHash: string,
) {
    const user = await tx.user.update({
        where: { id: userId },
        data: { passwordHash, sessionVersion: { increment: 1 } },
    });

    await tx.refreshSession.deleteMany({ where: { userId } });
    await tx.passwordRecovery.deleteMany({ where: { userId } });

    return { email: user.email };
}

export function resetPasswordWithToken(resetTokenHash: string, passwordHash: string) {
    return runSessionTransaction(async (tx) => {
        const recovery = await tx.passwordRecovery.findUnique({ where: { resetTokenHash } });

        if (!recovery) return null;

        const user = await lockUserForSession(tx, recovery.userId);

        if (!user) return null;

        // Revalida após o bloqueio: outro reset, reenvio ou troca pode ter consumido o token.
        const consumed = await tx.passwordRecovery.deleteMany({
            where: {
                id: recovery.id,
                resetTokenHash,
                resetTokenExpiresAt: { gt: new Date() },
            },
        });

        if (consumed.count !== 1) return null;

        return updatePasswordAndRevokeSessions(tx, user.id, passwordHash);
    });
}

export function changePasswordAndRevokeSessions(
    userId: number,
    expectedSessionVersion: number,
    passwordHash: string,
) {
    return runSessionTransaction(async (tx) => {
        const user = await lockUserForSession(tx, userId);

        if (!user || user.sessionVersion !== expectedSessionVersion) {
            throw new AppError("Sessão inválida. Entre novamente para alterar a senha.", 401);
        }

        return updatePasswordAndRevokeSessions(tx, user.id, passwordHash);
    });
}
