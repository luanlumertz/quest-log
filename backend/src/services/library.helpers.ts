import type { LibraryEntryData, UpdateLibraryEntryData } from "../types/library.types.js";
import { AppError } from "../errors/AppError.js";

type CurrentLibraryEntry = Pick<LibraryEntryData, "startedAt" | "completedAt">;

export function normalizeDate(date: Date) {
    const normalizedDate = new Date(date);

    normalizedDate.setUTCHours(0, 0, 0, 0);

    return normalizedDate;
}

export function formatLibraryEntry(entry: LibraryEntryData) {
    const { libraryEntryPlatforms, ...rest } = entry;

    return {
        ...rest,
        rating: rest.rating !== null ? Number(rest.rating) : null,
        platforms: libraryEntryPlatforms.map((item) => ({
            id: item.platform.id,
            name: item.platform.name,
        })),
    };
}

export function normalizeLibraryEntryDates(data: UpdateLibraryEntryData): UpdateLibraryEntryData {
    const updatedData: UpdateLibraryEntryData = { ...data };

    if (updatedData.startedAt instanceof Date) {
        updatedData.startedAt = normalizeDate(updatedData.startedAt);
    }

    if (updatedData.completedAt instanceof Date) {
        updatedData.completedAt = normalizeDate(updatedData.completedAt);
    }

    return updatedData;
}

export function validateLibraryEntryDates(
    currentEntry: CurrentLibraryEntry,
    data: UpdateLibraryEntryData,
) {
    const finalStartedAt = data.startedAt !== undefined ? data.startedAt : currentEntry.startedAt;

    const finalCompletedAt =
        data.completedAt !== undefined ? data.completedAt : currentEntry.completedAt;

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
