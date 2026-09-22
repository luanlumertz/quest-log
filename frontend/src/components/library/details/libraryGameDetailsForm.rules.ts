import type { GameStatus } from "../../../types/game.types";
import type { LibraryEntryDetails } from "../../../types/library.types";
import type { UpdateLibraryEntryData } from "../../../schema/library.schema";
import { dateInputToDate, dateToInputValue, hoursInputToMinutes, minutesToHoursInput, ratingInputToNumber } from "./libraryGameDetailsForm.utils";

export type LibraryGameDetailsFormValues = {
    status: GameStatus;
    rating: string;
    playtimeHours: string;
    platforms: number[];
    startedAt: string;
    completedAt: string;
};

export type DataLossField =
    | "rating"
    | "playtimeMinutes"
    | "startedAt"
    | "completedAt";

export type DateValidationError = {
    field: "startedAt" | "completedAt";
    message: string;
};

export function applyStatusRules(values: LibraryGameDetailsFormValues, today: string): LibraryGameDetailsFormValues {
    const nextValues = { ...values };

    switch (nextValues.status) {
        case "WANT_TO_PLAY":
            nextValues.rating = "";
            nextValues.startedAt = "";
            nextValues.completedAt = "";
            break;

        case "PLAYING":
            if (!nextValues.startedAt) {
                nextValues.startedAt = today;
            }

            nextValues.completedAt = "";
            break;

        case "COMPLETED":
            if (!nextValues.completedAt) {
                nextValues.completedAt = today;
            }

            break;

        case "ABANDONED":
            nextValues.completedAt = "";
            break;
    }

    return nextValues;
}

export function createDefaultValues(
    entry: LibraryEntryDetails,
    today: string
): LibraryGameDetailsFormValues {
    const values: LibraryGameDetailsFormValues = {
        status: entry.status,

        rating: entry.rating !== null ? entry.rating.toString().replace(".", ",") : "",

        playtimeHours: minutesToHoursInput(entry.playtimeMinutes),

        platforms: entry.platforms.map((platform) => platform.id),

        startedAt: dateToInputValue(entry.startedAt),

        completedAt: dateToInputValue(entry.completedAt)
    };

    return applyStatusRules(values, today);
}

export function createValuesForStatus(
    values: LibraryGameDetailsFormValues,
    status: GameStatus,
    today: string
) {
    return applyStatusRules(
        { ...values, status },
        today
    );
}

export function createUpdateCandidate(
    values: LibraryGameDetailsFormValues,
    today: string
): UpdateLibraryEntryData {
    const normalizedValues = applyStatusRules(values, today);

    return {
        status: normalizedValues.status,

        rating: ratingInputToNumber(normalizedValues.rating),

        playtimeMinutes: hoursInputToMinutes(normalizedValues.playtimeHours),

        platforms: normalizedValues.platforms,

        startedAt: dateInputToDate(normalizedValues.startedAt),

        completedAt: dateInputToDate(normalizedValues.completedAt)
    };
}

export function getDateValidationError(
    values: LibraryGameDetailsFormValues,
    today: string
): DateValidationError | null {
    const normalizedValues = applyStatusRules(values, today);
    const { startedAt, completedAt } = normalizedValues;

    if (startedAt && startedAt > today) {
        return {
            field: "startedAt",
            message: "A data de início não pode estar no futuro"
        };
    }

    if (completedAt && completedAt > today) {
        return {
            field: "completedAt",
            message: "A data de conclusão não pode estar no futuro"
        };
    }

    if (startedAt && completedAt && completedAt < startedAt) {
        return {
            field: "completedAt",
            message: "A data de conclusão não pode ser anterior à data de início"
        };
    }

    return null;
}

export function getFieldsClearedOnSave(
    entry: LibraryEntryDetails,
    data: UpdateLibraryEntryData
): DataLossField[] {
    const fields: DataLossField[] = [];

    if (entry.rating !== null && data.rating === null) {
        fields.push("rating");
    }

    if (entry.playtimeMinutes > 0 && data.playtimeMinutes === 0) {
        fields.push("playtimeMinutes");
    }

    if (entry.startedAt !== null && data.startedAt === null) {
        fields.push("startedAt");
    }

    if (entry.completedAt !== null && data.completedAt === null) {
        fields.push("completedAt");
    }

    return fields;
}
