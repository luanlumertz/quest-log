import type { GameDetailsResult, GameSearchResult } from "../../src/types/game.types";

export function createGameSearchResult(
    overrides: Partial<GameSearchResult> = {},
): GameSearchResult {
    return {
        externalId: 123,
        title: "Elden Ring",
        releaseDate: "2022-02-25",
        coverUrl: null,
        platforms: ["PC"],
        ...overrides,
    };
}

export function createGameDetails(overrides: Partial<GameDetailsResult> = {}): GameDetailsResult {
    return {
        ...createGameSearchResult(),
        description: "",
        genres: [],
        developers: [],
        publishers: [],
        ...overrides,
    };
}
