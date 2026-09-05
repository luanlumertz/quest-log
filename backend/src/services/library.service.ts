import type { GameStatus } from "@prisma/client";
import { AppError } from "../errors/AppError.js";
import { getRawgGameById } from "../integrations/rawg.js";
import { createGame, createGamePlatform, findGameByExternalId } from "../repositories/game.repository.js";
import { createLibraryEntry, createLibraryEntryPlatform, gameInUserLibraryEntryExists } from "../repositories/library.repository.js";
import { createPlatform, findPlatformByName, findPlatformsByGameId } from "../repositories/platform.repository.js";
import type { CreateGameData } from "../types/game.types.js";
import type { AddGameToLibraryRepositoryData, AddGameToLibraryServiceData } from "../types/library.types.js";

async function getOrCreateGame(externalId: number) {
    let game = await findGameByExternalId(externalId);

    if (game) {
        return game;
    }

    const gameRawg = await getRawgGameById(externalId);

    const createData: CreateGameData = {
        externalId: gameRawg.externalId,
        title: gameRawg.title,
        coverUrl: gameRawg.coverUrl,
        releaseDate: gameRawg.releaseDate ? new Date(gameRawg.releaseDate) : null
    };

    game = await createGame(createData);

    const rawgPlatforms = [...new Set(gameRawg.platforms
        .map(platform => platform.trim())
        .filter(platform => platform !== "")
    )
    ];

    for (const namePlatform of rawgPlatforms) {
        let platform = await findPlatformByName(namePlatform);

        if (!platform) {
            platform = await createPlatform(namePlatform);
        }

        await createGamePlatform(game.id, platform.id);
    }

    return game;
}

async function validateSelectedPlatforms(gameId: number, selectedPlatforms: string[]) {
    const availablePlatforms = await findPlatformsByGameId(gameId);

    const unavailablePlatforms = selectedPlatforms.filter(namePlatform => !availablePlatforms.some(platform => platform.name === namePlatform));

    if (unavailablePlatforms.length > 0) {
        const platformsText = unavailablePlatforms.join(", ");

        throw new AppError(`Plataforma(s) não disponível(is) para este jogo: ${platformsText}`, 400);
    }

    return availablePlatforms;
}

function getInitialDates(status: GameStatus) {
    switch (status) {
        case "PLAYING":
            return {
                startedAt: new Date(),
                completedAt: null
            };

        case "COMPLETED":
            return {
                startedAt: null,
                completedAt: new Date()
            };

        default:
            return {
                startedAt: null,
                completedAt: null
            };
    }
}

export async function addGameToLibraryEntry(data: AddGameToLibraryServiceData) {
    const entryExists = await gameInUserLibraryEntryExists(data.userId, data.externalId);

    if (entryExists) {
        throw new AppError("Este jogo já está na sua biblioteca", 409);
    }

    const game = await getOrCreateGame(data.externalId);

    const availablePlatforms = await validateSelectedPlatforms(game.id, data.platforms);

    const { startedAt, completedAt } = getInitialDates(data.status);

    const createLibraryEntryData: AddGameToLibraryRepositoryData = {
        userId: data.userId,
        gameId: game.id,
        status: data.status,
        startedAt,
        completedAt
    };

    const libraryEntry = await createLibraryEntry(createLibraryEntryData);

    for (const namePlatform of data.platforms) {
        const platform = availablePlatforms.find(platform => platform.name === namePlatform);

        if (!platform) {
            throw new AppError("Erro ao associar plataforma à biblioteca", 500);
        }

        await createLibraryEntryPlatform(data.userId, game.id, platform.id);
    }

    return { ...libraryEntry, platforms: data.platforms };
}