import { getRawgGameById } from "../integrations/rawg.js";
import { saveGameWithPlatforms, findGameByExternalId } from "../repositories/game.repository.js";
import type { CreateGameData } from "../types/game.types.js";

export async function getOrCreateGame(externalId: number) {
    const game = await findGameByExternalId(externalId);

    if (game) {
        return game;
    }

    const gameRawg = await getRawgGameById(externalId);

    const createData: CreateGameData = {
        externalId: gameRawg.externalId,
        title: gameRawg.title,
        coverUrl: gameRawg.coverUrl,
        releaseDate: gameRawg.releaseDate ? new Date(gameRawg.releaseDate) : null,
    };

    const rawgPlatforms = [
        ...new Set(
            gameRawg.platforms
                .map((platform) => platform.trim())
                .filter((platform) => platform !== ""),
        ),
    ].sort();

    return saveGameWithPlatforms(createData, rawgPlatforms);
}
