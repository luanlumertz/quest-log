import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/AppError.js";
import { lockUserForSession, runSessionTransaction } from "./session.repository.js";

export function createRefreshSession(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    sessionVersion = 0,
) {
    return runSessionTransaction(async (tx) => {
        const user = await lockUserForSession(tx, userId);

        if (!user || user.sessionVersion !== sessionVersion) {
            throw new AppError("Sessão inválida", 401);
        }

        return tx.refreshSession.create({
            data: { userId, tokenHash, expiresAt },
        });
    });
}

export function findRefreshSessionByTokenHash(tokenHash: string) {
    return prisma.refreshSession.findUnique({
        where: {
            tokenHash,
        },
        include: { user: { select: { sessionVersion: true } } },
    });
}

export function deleteRefreshSessionById(id: number) {
    return prisma.refreshSession.delete({
        where: {
            id,
        },
    });
}

export function rotateRefreshSession(
    oldSessionId: number,
    userId: number,
    newTokenHash: string,
    expiresAt: Date,
    sessionVersion = 0,
) {
    return runSessionTransaction(async (tx) => {
        const user = await lockUserForSession(tx, userId);

        if (!user || user.sessionVersion !== sessionVersion) {
            throw new AppError("Sessão inválida", 401);
        }

        const deleted = await tx.refreshSession.deleteMany({
            where: {
                id: oldSessionId,
                userId,
                expiresAt: { gt: new Date() },
            },
        });

        if (deleted.count !== 1) {
            throw new AppError("Sessão inválida", 401);
        }

        return tx.refreshSession.create({
            data: {
                userId,
                tokenHash: newTokenHash,
                expiresAt,
            },
        });
    });
}
