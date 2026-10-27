import { E2E_GAME } from "../fixtures/game.fixture.js";
import { withE2EDatabase } from "../helpers/db.helper.js";

export async function seedE2EGame() {
    await withE2EDatabase(async (db) => {
        const gameData = {
            title: E2E_GAME.title,
            coverUrl: E2E_GAME.coverUrl,
            releaseDate: E2E_GAME.releaseDate,
        };
        const game = await db.game.upsert({
            where: { externalId: E2E_GAME.externalId },
            update: gameData,
            create: {
                externalId: E2E_GAME.externalId,
                ...gameData,
            },
        });

        const platformIds: number[] = [];

        for (const name of E2E_GAME.platforms) {
            const platform = await db.platform.upsert({
                where: { name },
                update: {},
                create: { name },
            });

            platformIds.push(platform.id);

            await db.gamePlatform.upsert({
                where: {
                    gameId_platformId: {
                        gameId: game.id,
                        platformId: platform.id,
                    },
                },
                update: {},
                create: {
                    gameId: game.id,
                    platformId: platform.id,
                },
            });
        }

        // Remove somente associações antigas do jogo fixo que saíram da fixture.
        await db.gamePlatform.deleteMany({
            where: { gameId: game.id, platformId: { notIn: platformIds } },
        });
    });

    console.log("Jogo E2E preparado com sucesso.");
}
