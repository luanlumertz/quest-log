import { test, expect } from "../fixtures/test.fixture";
import { E2E_GAME } from "../fixtures/game.fixture";
import { mockGameCatalog } from "../helpers/rawg.helper";

test("deve preservar a busca e a página ao voltar dos detalhes e recarregar", async ({
    page,
    authenticatedUser: _authenticatedUser,
}) => {
    const query = "Jogo E2E";
    const secondGame = {
        ...E2E_GAME,
        externalId: 900000002,
        title: "Jogo E2E da segunda página",
    };

    await mockGameCatalog(page, { games: [E2E_GAME, secondGame], pageSize: 1 });

    await page.goto("/games/search");

    const search = page.getByRole("searchbox", { name: "Pesquisar jogos" });
    const pagination = page.getByRole("navigation", { name: "Paginação dos jogos" });
    const firstHeading = page.getByRole("heading", { name: E2E_GAME.title, exact: true });
    const secondHeading = page.getByRole("heading", { name: secondGame.title, exact: true });
    const secondPageURL = `/games/search?${new URLSearchParams({ query, page: "2" })}`;

    await search.fill(query);
    await page.getByRole("button", { name: "Pesquisar", exact: true }).click();

    await expect(firstHeading).toBeVisible();
    await expect(pagination.getByText("Página 1", { exact: true })).toBeVisible();

    await pagination.getByRole("button", { name: "Próxima", exact: true }).click();

    await expect(page).toHaveURL(secondPageURL);
    await expect(secondHeading).toBeVisible();
    await expect(firstHeading).toHaveCount(0);

    await page.getByRole("link").filter({ has: secondHeading }).click();

    await expect(page).toHaveURL(`/games/${secondGame.externalId}`);
    await expect(
        page.getByRole("heading", { name: secondGame.title, exact: true, level: 1 }),
    ).toBeVisible();

    // Usa o histórico real do navegador para retornar à busca.
    await page.goBack();

    await expect(page).toHaveURL(secondPageURL);
    await expect(search).toHaveValue(query);
    await expect(pagination.getByText("Página 2", { exact: true })).toBeVisible();
    await expect(secondHeading).toBeVisible();
    await expect(firstHeading).toHaveCount(0);

    // Confirma que a URL restaura a busca mesmo sem o estado em memória.
    await page.reload();

    await expect(page).toHaveURL(secondPageURL);
    await expect(search).toHaveValue(query);
    await expect(pagination.getByText("Página 2", { exact: true })).toBeVisible();
    await expect(secondHeading).toBeVisible();
    await expect(firstHeading).toHaveCount(0);
});
