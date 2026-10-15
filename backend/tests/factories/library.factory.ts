import type { AddGameToLibraryData } from "../types/library.types.js";

export function createLibraryPayload(
    overrides: Partial<AddGameToLibraryData> = {},
): AddGameToLibraryData {
    return {
        externalId: 123,
        status: "WANT_TO_PLAY" as const,
        platforms: ["PC"],
        ...overrides,
    };
}
