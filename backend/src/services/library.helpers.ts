import type { GameStatus } from "@prisma/client";
import type { LibraryEntryData, UpdateLibraryEntryData } from "../types/library.types.js";
import { AppError } from "../errors/AppError.js";

export function normalizeDate(date: Date) {
    const normalizedDate = new Date(date);

    normalizedDate.setUTCHours(0, 0, 0, 0);

    return normalizedDate;
}

export function getInitialDates(status: GameStatus) {
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

export function formatLibraryEntry(entry: LibraryEntryData) {
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

export function applyLibraryEntryStatusRules(currentEntry: LibraryEntryData, data: UpdateLibraryEntryData): UpdateLibraryEntryData {
    const updatedData: UpdateLibraryEntryData = { ...data };

    if (updatedData.startedAt instanceof Date) {
        updatedData.startedAt = normalizeDate(updatedData.startedAt);
    }

    if (updatedData.completedAt instanceof Date) {
        updatedData.completedAt = normalizeDate(updatedData.completedAt);
    }

    const finalStatus = updatedData.status ?? currentEntry.status;

    switch (finalStatus) {
        case "WANT_TO_PLAY":
            if (updatedData.startedAt !== undefined && updatedData.startedAt !== null) {
                throw new AppError("Um jogo com status WANT_TO_PLAY não pode possuir data de início", 400);
            }

            if (updatedData.completedAt !== undefined && updatedData.completedAt !== null) {
                throw new AppError("Um jogo com status WANT_TO_PLAY não pode possuir data de conclusão", 400);
            }

            updatedData.rating = null;
            updatedData.startedAt = null;
            updatedData.completedAt = null;

            break;

        case "PLAYING":
            if (updatedData.startedAt === null) {
                throw new AppError("Um jogo com status PLAYING deve possuir uma data de início", 400);
            }

            if (updatedData.completedAt !== undefined && updatedData.completedAt !== null) {
                throw new AppError("Um jogo com status PLAYING não pode possuir data de conclusão", 400);
            }

            if (currentEntry.startedAt === null && updatedData.startedAt === undefined) {
                updatedData.startedAt = normalizeDate(new Date());
            }

            updatedData.completedAt = null;

            break;

        case "COMPLETED":
            if (updatedData.completedAt === null) {
                throw new AppError("Um jogo com status COMPLETED deve possuir uma data de conclusão", 400);
            }

            if (currentEntry.completedAt === null && updatedData.completedAt === undefined) {
                updatedData.completedAt = normalizeDate(new Date());
            }

            break;

        case "ABANDONED":
            if (updatedData.completedAt !== undefined && updatedData.completedAt !== null) {
                throw new AppError("Um jogo com status ABANDONED não pode possuir data de conclusão", 400);
            }

            updatedData.completedAt = null;

            break;
    }

    return updatedData;
}

export function validateLibraryEntryDates(currentEntry: LibraryEntryData, data: UpdateLibraryEntryData) {
    const finalStartedAt = data.startedAt !== undefined ? data.startedAt : currentEntry.startedAt;

    const finalCompletedAt = data.completedAt !== undefined ? data.completedAt : currentEntry.completedAt;

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
}