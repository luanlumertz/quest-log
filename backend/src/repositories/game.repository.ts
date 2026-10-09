import { prisma } from "../lib/prisma.js";
import type { CreateGameData } from "../types/game.types.js";

export function findGameByExternalId(externalId: number) {
    return prisma.game.findUnique({
        where: { externalId },
    });
}

export function createGame(data: CreateGameData) {
    return prisma.game.create({
        data: {
            externalId: data.externalId,
            title: data.title,
            coverUrl: data.coverUrl ?? null,
            releaseDate: data.releaseDate ?? null,
        },
    });
}

export function createGamePlatform(gameId: number, platformId: number) {
    return prisma.gamePlatform.create({
        data: {
            gameId,
            platformId,
        },
    });
}
