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

export const rawgSearchApiResponse = {
    next: null,
    previous: null,
    results: [
        {
            id: 123,
            name: "Elden Ring",
            background_image: "https://example.com/cover.jpg",
            released: "2022-02-25",
            platforms: [{ platform: { name: "PC" } }, { platform: { name: "PlayStation 5" } }],
        },
    ],
};

export const rawgDetailsApiResponse = {
    id: 123,
    name: "Elden Ring",
    background_image: "https://example.com/cover.jpg",
    released: "2022-02-25",
    description_raw: "Um RPG de ação em mundo aberto.",
    genres: [{ name: "Action" }, { name: "RPG" }],
    platforms: [{ platform: { name: "PC" } }, { platform: { name: "PlayStation 5" } }],
    developers: [{ name: "FromSoftware" }],
    publishers: [{ name: "Bandai Namco Entertainment" }],
};

export function createRawgGameDetails(
    overrides: Partial<GameDetailsResult> = {},
): GameDetailsResult {
    return {
        ...genericGameDetailsResult,
        ...overrides,
    };
}
