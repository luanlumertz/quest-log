import type { GameStatus } from "../../../types/game.types";
import type { LibraryEntryDetails } from "../../../types/library.types";
import type { UpdateLibraryEntryData } from "../../../schema/library.schema";
import {
    dateInputToDate,
    dateToInputValue,
    hoursInputToMinutes,
    minutesToHoursInput,
    ratingInputToNumber,
} from "./libraryGameDetailsForm.utils";

export type LibraryGameDetailsFormValues = {
    status: GameStatus;
    rating: string;
    playtimeHours: string;
    platforms: number[];
    startedAt: string;
    completedAt: string;
};

export type DateValidationError = {
    field: "startedAt" | "completedAt";
    message: string;
};

export function createDefaultValues(entry: LibraryEntryDetails): LibraryGameDetailsFormValues {
    return {
        status: entry.status,
        rating: entry.rating !== null ? entry.rating.toString().replace(".", ",") : "",
        playtimeHours: minutesToHoursInput(entry.playtimeMinutes),
        platforms: entry.platforms.map((platform) => platform.id),
        startedAt: dateToInputValue(entry.startedAt),
        completedAt: dateToInputValue(entry.completedAt),
    };
}

export function createUpdateCandidate(
    values: LibraryGameDetailsFormValues,
    changedFields: (keyof LibraryGameDetailsFormValues)[],
): UpdateLibraryEntryData {
    const data: UpdateLibraryEntryData = {};

    if (changedFields.includes("status")) {
        data.status = values.status;
    }

    if (changedFields.includes("rating")) {
        data.rating = ratingInputToNumber(values.rating);
    }

    if (changedFields.includes("playtimeHours")) {
        data.playtimeMinutes = hoursInputToMinutes(values.playtimeHours);
    }

    if (changedFields.includes("platforms")) {
        data.platforms = values.platforms;
    }

    if (changedFields.includes("startedAt")) {
        data.startedAt = dateInputToDate(values.startedAt);
    }

    if (changedFields.includes("completedAt")) {
        data.completedAt = dateInputToDate(values.completedAt);
    }

    return data;
}

export function getDateValidationError(
    values: LibraryGameDetailsFormValues,
    today: string,
): DateValidationError | null {
    const { startedAt, completedAt } = values;

    if (startedAt && startedAt > today) {
        return {
            field: "startedAt",
            message: "A data de início não pode estar no futuro",
        };
    }

    if (completedAt && completedAt > today) {
        return {
            field: "completedAt",
            message: "A data de conclusão não pode estar no futuro",
        };
    }

    if (startedAt && completedAt && completedAt < startedAt) {
        return {
            field: "completedAt",
            message: "A data de conclusão não pode ser anterior à data de início",
        };
    }

    return null;
}
