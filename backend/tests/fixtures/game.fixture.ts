import { prisma } from "../../src/lib/prisma.js";

export function countGamesByExternalId(externalId: number) {
    return prisma.game.count({
        where: {
            externalId,
        },
    });
}

export function findGamePlatformByGameIdAndPlatformId(gameId: number, platformId: number) {
    return prisma.gamePlatform.findUnique({
        where: {
            gameId_platformId: {
                gameId,
                platformId,
            },
        },
    });
}

export function findGamePlatformsByGameId(gameId: number) {
    return prisma.gamePlatform.findMany({
        where: {
            gameId,
        },
    });
}

export function countGamePlatformsByGameIdAndPlatformId(gameId: number, platformId: number) {
    return prisma.gamePlatform.count({
        where: {
            gameId,
            platformId,
        },
    });
}

export function countGamePlatformsByGameId(gameId: number) {
    return prisma.gamePlatform.count({
        where: {
            gameId,
        },
    });
}
