import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

export function findPlatformByName(namePlatform: string) {
    return prisma.platform.findUnique({
        where: {
            name: namePlatform,
        },
    });
}

export async function getOrCreatePlatforms(names: string[], tx: Prisma.TransactionClient) {
    await tx.platform.createMany({
        data: names.map((name) => ({ name })),
        skipDuplicates: true,
    });

    return tx.platform.findMany({
        where: { name: { in: names } },
        select: { id: true },
    });
}

export function findPlatformsByGameId(gameId: number) {
    return prisma.platform.findMany({
        where: {
            games: {
                some: {
                    gameId,
                },
            },
        },
        select: {
            id: true,
            name: true,
        },
    });
}
