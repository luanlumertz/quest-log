import type { LibraryEntryData } from "../../src/types/library.types.js";

type CurrentLibraryEntry = Pick<LibraryEntryData, "status" | "startedAt" | "completedAt">;

export function createCurrentLibraryEntry(
    overrides: Partial<CurrentLibraryEntry> = {},
): CurrentLibraryEntry {
    return {
        status: "WANT_TO_PLAY",
        startedAt: null,
        completedAt: null,
        ...overrides,
    };
}

export function createLibraryEntry(overrides: Partial<LibraryEntryData> = {}): LibraryEntryData {
    return {
        status: "WANT_TO_PLAY",
        rating: null,
        playtimeMinutes: 0,
        startedAt: null,
        completedAt: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        game: {
            id: 1,
            externalId: 123,
            title: "Test Game",
            coverUrl: null,
            releaseDate: null,
        },
        libraryEntryPlatforms: [],
        ...overrides,
    };
}
