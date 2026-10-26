import type { Page } from "@playwright/test";
import { E2E_GAME } from "../fixtures/game.fixture";
import { API_URL } from "./env.helper";

export async function mockGameCatalog(page: Page) {
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
                const matches = E2E_GAME.title.toLowerCase().includes(query);
                const game = {
                    externalId: E2E_GAME.externalId,
                    title: E2E_GAME.title,
                    coverUrl: E2E_GAME.coverUrl,
                    releaseDate: E2E_GAME.releaseDate,
                    platforms: E2E_GAME.platforms,
                };

                await route.fulfill({
                    json: {
                        games: matches && pageNumber === 1 ? [game] : [],
                        page: pageNumber,
                        hasPrevious: pageNumber > 1,
                        hasNext: false,
                    },
                });
                return;
            }

            if (url.pathname === `/games/${E2E_GAME.externalId}`) {
                await route.fulfill({ json: E2E_GAME });
                return;
            }

            await route.fulfill({ status: 404, json: { message: "Jogo não encontrado" } });
        },
    );
}
