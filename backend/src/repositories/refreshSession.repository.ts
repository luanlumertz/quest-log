import { prisma } from "../lib/prisma.js";

export function createRefreshSession(userId: number, tokenHash: string, expiresAt: Date) {
    return prisma.refreshSession.create({
        data: {
            userId,
            tokenHash,
            expiresAt
        }
    })
}

export function findRefreshSessionByTokenHash(tokenHash: string) {
    return prisma.refreshSession.findUnique({
        where: {
            tokenHash
        }
    })
}

export function deleteRefreshSessionById(id: number) {
    return prisma.refreshSession.delete({
        where: {
            id
        }
    })
}

export function deleteRefreshSessionsByUserId(userId: number) {
    return prisma.refreshSession.deleteMany({
        where: {
            userId
        }
    })
}

export function rotateRefreshSession(
    oldSessionId: number,
    userId: number,
    newTokenHash: string,
    expiresAt: Date
) {
    return prisma.$transaction(async (tx) => {
        await tx.refreshSession.delete({
            where: {
                id: oldSessionId
            }
        });

        return tx.refreshSession.create({
            data: {
                userId,
                tokenHash: newTokenHash,
                expiresAt
            }
        });
    });
}
