import { prisma } from "../lib/prisma.js";
import type { CreateGameData } from "../types/game.types.js";

export function findGameByExternalId(externalId: number) {
    return prisma.game.findUnique({
        where: { externalId }
    });
}

export function createGame(data: CreateGameData) {
    const createdGame = prisma.game.create({
        data: {
            externalId: data.externalId,
            title: data.title,
            coverUrl: data.coverUrl ?? null,
            releaseDate: data.releaseDate ?? null
        }
    })

    return createdGame;
}

export function createGamePlatform(gameId: number, platformId: number){
    const createdGamePlatform = prisma.gamePlatform.create({
        data: {
            gameId,
            platformId
        }
    })

    return createdGamePlatform;
}
