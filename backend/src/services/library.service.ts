import type { Game, GameStatus, LibraryEntry } from "@prisma/client";
import { AppError } from "../errors/AppError.js";
import { getRawgGameById } from "../integrations/rawg.js";
import { createGame, createGamePlatform, findGameByExternalId } from "../repositories/game.repository.js";
import { createLibraryEntry, createLibraryEntryPlatform, gameInUserLibraryEntryExists, findLibraryEntriesByUserId, findLibraryEntryByUserAndGameId, updateLibraryEntryByUserAndGameId } from "../repositories/library.repository.js";
import { createPlatform, findPlatformByName, findPlatformsByGameId } from "../repositories/platform.repository.js";
import type { CreateGameData } from "../types/game.types.js";
import type { AddGameToLibraryRepositoryData, AddGameToLibraryServiceData, LibraryEntryData, UpdateLibraryEntryData, UpdateLibraryEntryServiceData } from "../types/library.types.js";

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
                startedAt: normalizeDate(new Date()),
                completedAt: null
            };

        case "COMPLETED":
            return {
                startedAt: null,
                completedAt: normalizeDate(new Date())
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

function formatLibraryEntry(entry: LibraryEntryData) {
    const { libraryEntryPlatforms, ...rest } = entry;

    return {
        ...rest,
        rating: rest.rating !== null ? Number(rest.rating) : null,
        platforms: libraryEntryPlatforms.map(item => ({
            id: item.platform.id,
            name: item.platform.name
        }))
    };
}

export async function getLibraryEntries(userId: number) {
    const libraryEntries = await findLibraryEntriesByUserId(userId);

    return libraryEntries.map(formatLibraryEntry);
}

export async function getLibraryEntryDetails(userId: number, gameId: number) {
    const libraryDetails = await findLibraryEntryByUserAndGameId(userId, gameId);

    if (libraryDetails == null) {
        throw new AppError("Jogo não encontrado na biblioteca do usuário", 404)
    }

    return formatLibraryEntry(libraryDetails);
}

function normalizeDate(date: Date) {
    const normalizedDate = new Date(date);

    normalizedDate.setUTCHours(0, 0, 0, 0);

    return normalizedDate;
}

export async function updateLibraryEntry(userId: number, gameId: number, data: UpdateLibraryEntryServiceData) {
    const { platforms, ...libraryEntryData } = data

    const libraryEntry = await findLibraryEntryByUserAndGameId(userId, gameId);

    if (libraryEntry == null) {
        throw new AppError("Jogo não encontrado na biblioteca do usuário", 404);
    }

    const finalStatus = libraryEntryData.status ?? libraryEntry.status;
    switch (finalStatus) {
        case "WANT_TO_PLAY":


            if (libraryEntryData.startedAt !== undefined && libraryEntryData.startedAt !== null) {
                throw new AppError("Um jogo com status WANT_TO_PLAY não pode possuir data de início", 400);
            }

            if (libraryEntryData.completedAt !== undefined && libraryEntryData.completedAt !== null) {
                throw new AppError("Um jogo com status WANT_TO_PLAY não pode possuir data de conclusão", 400);
            }

            libraryEntryData.rating = null;
            libraryEntryData.startedAt = null;
            libraryEntryData.completedAt = null;

            break;
        case "PLAYING":

            if (libraryEntryData.startedAt === null) {
                throw new AppError("Um jogo com status PLAYING deve possuir uma data de início", 400);
            }

            if (libraryEntryData.completedAt !== undefined && libraryEntryData.completedAt !== null) {
                throw new AppError("Um jogo com status PLAYING não pode possuir data de conclusão", 400);
            }

            if (libraryEntry.startedAt === null && libraryEntryData.startedAt === undefined) {
                libraryEntryData.startedAt = normalizeDate(new Date());
            }

            libraryEntryData.completedAt = null;

            break;
        case "COMPLETED": {


            if (libraryEntryData.completedAt === null) {
                throw new AppError("Um jogo com status COMPLETED deve possuir uma data de conclusão", 400);
            }

            if (libraryEntry.completedAt === null && libraryEntryData.completedAt === undefined) {
                libraryEntryData.completedAt = normalizeDate(new Date());
            }

            break;
        }
        case "ABANDONED":
            if (libraryEntryData.completedAt !== undefined && libraryEntryData.completedAt !== null) {
                throw new AppError("Um jogo com status ABANDONED não pode possuir data de conclusão", 400);
            }

            libraryEntryData.completedAt = null;

            break;
    }

    const finalStartedAt = libraryEntryData.startedAt !== undefined ? libraryEntryData.startedAt : libraryEntry.startedAt;

    const finalCompletedAt = libraryEntryData.completedAt !== undefined ? libraryEntryData.completedAt : libraryEntry.completedAt;

    const today = normalizeDate(new Date());

    const startedDay = finalStartedAt !== null ? normalizeDate(finalStartedAt) : null;

    const completedDay = finalCompletedAt !== null ? normalizeDate(finalCompletedAt) : null;

    if (startedDay !== null && startedDay > today) {
        throw new AppError("A data de início não pode estar no futuro", 400);
    }

    if (completedDay !== null && completedDay > today) {
        throw new AppError("A data de conclusão não pode estar no futuro", 400);
    }

    if (startedDay !== null && completedDay !== null && completedDay < startedDay) {
        throw new AppError("A data de conclusão não pode ser anterior à data de início", 400);
    }

    // ... parte de platforms ⇣

    const updatedLibraryEntry = await updateLibraryEntryByUserAndGameId(userId, gameId, libraryEntryData);
}
