import type { GameDetailsResult } from "../../src/types/rawgGame.types.js";
import { genericGameDetailsResult } from "../fixtures/rawg.fixture.js";

export function createRawgGameDetails(
    overrides: Partial<GameDetailsResult> = {},
): GameDetailsResult {
    return {
        ...genericGameDetailsResult,
        ...overrides,
    };
}
