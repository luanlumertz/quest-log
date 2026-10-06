import { vi } from "vitest";

import { getRawgGameById, searchRawgGames } from "../../src/integrations/rawg.js";
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

export function mockRawgSearch(games: GameSearchResult[] = genericGameSearchResult) {
    const mockedSearch = vi.mocked(searchRawgGames);

    mockedSearch.mockResolvedValue(games);

    return mockedSearch;
}

export function mockRawgSearchError(error: Error) {
    const mockedSearch = vi.mocked(searchRawgGames);

    mockedSearch.mockRejectedValue(error);

    return mockedSearch;
}

export function mockRawgGameDetails(game: GameDetailsResult = genericGameDetailsResult) {
    const mockedGetById = vi.mocked(getRawgGameById);

    mockedGetById.mockResolvedValue(game);

    return mockedGetById;
}

export function mockRawgGameDetailsError(error: Error) {
    const mockedDetails = vi.mocked(getRawgGameById);

    mockedDetails.mockRejectedValue(error);

    return mockedDetails;
}
