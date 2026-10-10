import type { GameDetailsResult, GameSearchResult } from "../../src/types/rawgGame.types.js";

export const genericGameSearchResult: GameSearchResult[] = [
    {
        externalId: 123,
        title: "Test Game",
        coverUrl: "https://example.com/test-game.jpg",
        releaseDate: "2025-01-01",
        platforms: ["PC"],
    },
];

export const genericGameDetailsResult: GameDetailsResult = {
    externalId: 123,
    title: "Test Game",
    coverUrl: "https://example.com/test-game.jpg",
    releaseDate: "2025-01-01",
    description: "Test game description",
    genres: ["Action", "RPG"],
    platforms: ["PC"],
    developers: ["Test Developer"],
    publishers: ["Test Publisher"],
};

export function createRawgGameDetails(
    overrides: Partial<GameDetailsResult> = {},
): GameDetailsResult {
    return {
        ...genericGameDetailsResult,
        ...overrides,
    };
}
