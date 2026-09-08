import { AppError } from "../errors/AppError.js";
import { createLibraryEntry, createLibraryEntryPlatform, gameInUserLibraryEntryExists, findLibraryEntriesByUserId, findLibraryEntryByUserAndGameId, updateLibraryEntryByUserAndGameId, replaceLibraryEntryPlatforms } from "../repositories/library.repository.js";
import type { AddGameToLibraryRepositoryData, AddGameToLibraryServiceData, UpdateLibraryEntryServiceData } from "../types/library.types.js";
import { runInTransaction } from "../repositories/transaction.repository.js";
import { applyLibraryEntryStatusRules, formatLibraryEntry, getInitialDates, validateLibraryEntryDates } from "./library.helpers.js";
import { getOrCreateGame } from "./library-game.service.js";
import { validateLibraryEntryPlatformIds, validateSelectedPlatforms } from "./library-platform.service.js";

async function findLibraryEntryOrThrow(userId: number, gameId: number) {
    const libraryEntry = await findLibraryEntryByUserAndGameId(userId, gameId);

    if (libraryEntry === null) {
        throw new AppError("Jogo não encontrado na biblioteca do usuário", 404);
    }

    return libraryEntry;
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

    const libraryEntry = await runInTransaction(async (tx) => {
        const createdLibraryEntry = await createLibraryEntry(createLibraryEntryData, tx);

        for (const namePlatform of data.platforms) {
            const platform = availablePlatforms.find(platform => platform.name === namePlatform);

            if (!platform) {
                throw new AppError("Erro ao associar plataforma à biblioteca", 500);
            }

            await createLibraryEntryPlatform(data.userId, game.id, platform.id, tx);
        }

        return createdLibraryEntry;
    });

    return { ...libraryEntry, platforms: data.platforms };
}

export async function getLibraryEntries(userId: number) {
    const libraryEntries = await findLibraryEntriesByUserId(userId);

    return libraryEntries.map(formatLibraryEntry);
}

export async function getLibraryEntryDetails(userId: number, gameId: number) {
    const libraryDetails = await findLibraryEntryOrThrow(userId, gameId);

    return formatLibraryEntry(libraryDetails);
}

export async function updateLibraryEntry(userId: number, gameId: number, data: UpdateLibraryEntryServiceData) {
    const { platforms, ...libraryEntryData } = data;

    const libraryEntry = await findLibraryEntryOrThrow(userId, gameId);

    const preparedLibraryEntryData = applyLibraryEntryStatusRules(libraryEntry, libraryEntryData);

    validateLibraryEntryDates(libraryEntry, preparedLibraryEntryData);

    if (platforms !== undefined) {
        await validateLibraryEntryPlatformIds(gameId, platforms);
    }

    await runInTransaction(async (tx) => {
        await updateLibraryEntryByUserAndGameId(userId, gameId, preparedLibraryEntryData, tx);

        if (platforms !== undefined) {
            await replaceLibraryEntryPlatforms(userId, gameId, platforms, tx);
        }
    });

    const updatedLibraryEntry = await findLibraryEntryOrThrow(userId, gameId);

    return formatLibraryEntry(updatedLibraryEntry);
}
