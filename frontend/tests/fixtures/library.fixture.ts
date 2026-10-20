import type { LibraryEntry, LibraryEntryDetails } from "../../src/types/library.types";

export function createLibraryEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
    return {
        rating: null,
        platforms: [],
        status: "WANT_TO_PLAY",
        playtimeMinutes: 0,
        startedAt: null,
        completedAt: null,
        createdAt: "2026-10-20T12:00:00.000Z",
        updatedAt: "2026-10-20T12:00:00.000Z",
        game: {
            id: 1,
            externalId: 123,
            title: "Elden Ring",
            coverUrl: null,
            releaseDate: "2022-02-25",
        },
        ...overrides,
    };
}

export function createLibraryEntryDetails(
    overrides: Partial<LibraryEntryDetails> = {},
): LibraryEntryDetails {
    return {
        ...createLibraryEntry(),
        availablePlatforms: [
            { id: 1, name: "PC" },
            { id: 2, name: "PlayStation 5" },
            { id: 3, name: "Xbox Series X" },
        ],
        ...overrides,
    };
}
