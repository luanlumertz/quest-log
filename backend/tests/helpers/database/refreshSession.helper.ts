import { prisma } from "../../../src/lib/prisma.js";

export function findRefreshSessionByUserId(userId: number) {
    return prisma.refreshSession.findFirst({
        where: {
            userId,
        },
    });
}

export function countRefreshSessionsByUserId(userId: number) {
    return prisma.refreshSession.count({
        where: {
            userId,
        },
    });
}
