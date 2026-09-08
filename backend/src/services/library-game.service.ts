import { getRawgGameById } from "../integrations/rawg.js";
import { createGame, createGamePlatform, findGameByExternalId } from "../repositories/game.repository.js";
import { createPlatform, findPlatformByName } from "../repositories/platform.repository.js";
import type { CreateGameData } from "../types/game.types.js";

export async function getOrCreateGame(externalId: number) {
    let game = await findGameByExternalId(externalId);

    if (game) {
        return game;
    }

    const gameRawg = await getRawgGameById(externalId);

    const createData: CreateGameData = {
        externalId: gameRawg.externalId,
        title: gameRawg.title,
        coverUrl: gameRawg.coverUrl,
        releaseDate: gameRawg.releaseDate ? new Date(gameRawg.releaseDate) : null
    };

    game = await createGame(createData);

    const rawgPlatforms = [...new Set(gameRawg.platforms
        .map(platform => platform.trim())
        .filter(platform => platform !== "")
    )
    ];

    for (const namePlatform of rawgPlatforms) {
        let platform = await findPlatformByName(namePlatform);

        if (!platform) {
            platform = await createPlatform(namePlatform);
        }

        await createGamePlatform(game.id, platform.id);
    }

    return game;
}