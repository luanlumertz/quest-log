import { vi } from "vitest";

import { getRawgGameById, searchRawgGames } from "../../src/integrations/rawg.js";
import type {
    GameDetailsResult,
    GameSearchResult,
    GameSearchResponse,
} from "../../src/types/rawgGame.types.js";

import { createRawgGameDetails, genericGameSearchResult } from "../factories/rawg.factory.js";

export function mockRawgSearch(
    games: GameSearchResult[] = genericGameSearchResult,
    pagination: Partial<Omit<GameSearchResponse, "games">> = {},
) {
    const mockedSearch = vi.mocked(searchRawgGames);

    mockedSearch.mockResolvedValue({
        games,
        page: 1,
        hasPrevious: false,
        hasNext: false,
        ...pagination,
    });

    return mockedSearch;
}

export function mockRawgSearchError(error: Error) {
    const mockedSearch = vi.mocked(searchRawgGames);

    mockedSearch.mockRejectedValue(error);

    return mockedSearch;
}

export function mockRawgGameDetails(overrides: Partial<GameDetailsResult> = {}) {
    const mockedGetById = vi.mocked(getRawgGameById);

    mockedGetById.mockResolvedValue(createRawgGameDetails(overrides));

    return mockedGetById;
}

export function mockRawgGameDetailsError(error: Error) {
    const mockedDetails = vi.mocked(getRawgGameById);

    mockedDetails.mockRejectedValue(error);

    return mockedDetails;
}
