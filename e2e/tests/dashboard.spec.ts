import { test, expect } from "../fixtures/test.fixture";
import { API_URL, API_REQUEST_HEADERS } from "../helpers/env.helper";

test("deve atualizar o dashboard após editar um jogo na biblioteca", async ({
    page,
    authenticatedUser: _authenticatedUser,
    catalogGame,
}) => {
    // Prepara um jogo na biblioteca usando a API real.
    const response = await page.context().request.post(`${API_URL}/library`, {
        headers: API_REQUEST_HEADERS,
        data: {
            externalId: catalogGame.externalId,
            status: "WANT_TO_PLAY",
            platforms: ["PC"],
        },
    });

    expect(response.status()).toBe(201);

    // Abre o dashboard para carregar os dados iniciais no cache.
    await page.goto("/dashboard");

    const header = page.getByRole("banner");

    const totalCard = page.getByRole("link").filter({
        has: page.getByRole("heading", { name: "Total de jogos", exact: true }),
    });

    const wantToPlayCard = page.getByRole("link").filter({
        has: page.getByRole("heading", { name: "Quero jogar", exact: true }),
    });

    const playingCard = page.getByRole("link").filter({
        has: page.getByRole("heading", { name: "Jogando", exact: true }),
    });

    const playtimeCard = page.locator("section").filter({
        has: page.getByRole("heading", { name: "Tempo jogado", exact: true }),
    });

    await expect(totalCard.getByText("1", { exact: true })).toBeVisible();
    await expect(wantToPlayCard.getByText("1", { exact: true })).toBeVisible();
    await expect(playingCard.getByText("0", { exact: true })).toBeVisible();
    await expect(playtimeCard.getByText("0 h", { exact: true })).toBeVisible();

    // Navega pela interface para preservar o cache entre as telas.
    await header.getByRole("link", { name: "Biblioteca", exact: true }).click();

    await expect(page).toHaveURL(/\/library$/);

    const libraryCard = page.getByRole("link").filter({
        has: page.getByRole("heading", { name: catalogGame.title, exact: true }),
    });

    await libraryCard.click();

    await page.getByRole("button", { name: "Jogando", exact: true }).click();
    await page.getByRole("textbox", { name: "Horas jogadas", exact: true }).fill("12,5");
    await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();

    await expect(page.getByRole("button", { name: "Salvo!" })).toBeVisible();

    // Volta sem recarregar e confere os indicadores atualizados.
    await header.getByRole("link", { name: "Visão Geral", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(wantToPlayCard.getByText("0", { exact: true })).toBeVisible();
    await expect(playingCard.getByText("1", { exact: true })).toBeVisible();
    await expect(playtimeCard.getByText("12,5 h", { exact: true })).toBeVisible();

    const nowPlaying = page.getByRole("region", { name: "Jogando agora", exact: true });

    await expect(
        nowPlaying.getByRole("heading", { name: catalogGame.title, exact: true }),
    ).toBeVisible();
});
