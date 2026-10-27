import type { Page } from "@playwright/test";
import { E2E_GAME } from "../fixtures/game.fixture";
import { API_URL } from "./env.helper";

export async function mockGameCatalog(
    page: Page,
    { games = [E2E_GAME], pageSize = 20 }: { games?: (typeof E2E_GAME)[]; pageSize?: number } = {},
) {
    const apiOrigin = new URL(API_URL).origin;

    await page.route(
        (url) =>
            url.origin === apiOrigin &&
            (url.pathname === "/games/search" || /^\/games\/\d+$/.test(url.pathname)),
        async (route) => {
            if (route.request().method() !== "GET") {
                await route.fallback();
                return;
            }

            const url = new URL(route.request().url());

            if (url.pathname === "/games/search") {
                const query = (url.searchParams.get("query") ?? "").trim().toLowerCase();
                const pageNumber = Number(url.searchParams.get("page") ?? 1);
                const matches = games.filter((game) => game.title.toLowerCase().includes(query));
                const start = (pageNumber - 1) * pageSize;
                const results = matches.slice(start, start + pageSize).map((game) => ({
                    externalId: game.externalId,
                    title: game.title,
                    coverUrl: game.coverUrl,
                    releaseDate: game.releaseDate,
                    platforms: game.platforms,
                }));

                await route.fulfill({
                    json: {
                        games: results,
                        page: pageNumber,
                        hasPrevious: pageNumber > 1,
                        hasNext: start + pageSize < matches.length,
                    },
                });
                return;
            }

            const game = games.find((game) => url.pathname === `/games/${game.externalId}`);

            if (game) {
                await route.fulfill({ json: game });
                return;
            }

            await route.fulfill({ status: 404, json: { message: "Jogo não encontrado" } });
        },
    );
}
