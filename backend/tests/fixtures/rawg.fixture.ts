import { vi } from "vitest";

import { searchRawgGames } from "../../src/integrations/rawg.js";
import type { GameSearchResult } from "../../src/types/rawgGame.types.js";

export const genericGameSearchResult: GameSearchResult[] = [
    {
        externalId: 123,
        title: "Test Game",
        coverUrl: "https://example.com/test-game.jpg",
        releaseDate: "2025-01-01",
        platforms: ["PC"],
    },
];

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
