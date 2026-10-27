import { test, expect } from "../fixtures/test.fixture";
import { API_URL } from "../helpers/env.helper";

test("deve adicionar um jogo à biblioteca e persistir após recarregar", async ({
    page,
    authenticatedUser: _authenticatedUser,
    catalogGame,
}) => {
    // As fixtures preparam o usuário autenticado e o catálogo controlado.
    await page.goto("/games/search");
    await page.getByRole("searchbox", { name: "Pesquisar jogos" }).fill(catalogGame.title);
    await page.getByRole("button", { name: "Pesquisar", exact: true }).click();

    const gameLink = page.getByRole("link").filter({
        has: page.getByRole("heading", {
            name: catalogGame.title,
            exact: true,
        }),
    });

    await gameLink.click();

    await expect(page).toHaveURL(new RegExp(`/games/${catalogGame.externalId}$`));

    await page.getByRole("button", { name: "Adicionar à biblioteca", exact: true }).click();

    const modal = page.getByRole("dialog", {
        name: catalogGame.title,
        exact: true,
    });

    await expect(modal).toBeVisible();
    await expect(modal.getByRole("button", { name: "Quero jogar", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );

    await modal.getByRole("button", { name: "PC", exact: true }).click();
    await modal.getByRole("button", { name: "Adicionar à biblioteca", exact: true }).click();

    await expect(modal).not.toBeVisible();
    await expect(page.getByRole("link", { name: "Ver na minha biblioteca" })).toBeVisible();

    await page.goto("/library");

    const libraryCard = page.getByRole("link").filter({
        has: page.getByRole("heading", {
            name: catalogGame.title,
            exact: true,
        }),
    });

    await expect(libraryCard).toBeVisible();

    await page.reload();

    await expect(libraryCard).toHaveCount(1);
    await expect(libraryCard).toBeVisible();
    await expect(libraryCard.getByText("Quero jogar", { exact: true })).toBeVisible();
    await expect(
        libraryCard.getByText("PC", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await expect(libraryCard.getByText("0 h", { exact: true })).toBeVisible();
});

test("deve editar o jogo e persistir as alterações após recarregar", async ({
    page,
    authenticatedUser: _authenticatedUser,
    catalogGame,
}) => {
    // Prepara a biblioteca usando a API real e os cookies do navegador.
    const response = await page.context().request.post(`${API_URL}/library`, {
        data: {
            externalId: catalogGame.externalId,
            status: "WANT_TO_PLAY",
            platforms: ["PC"],
        },
    });

    expect(response.status()).toBe(201);

    await page.goto("/library");

    const libraryCard = page.getByRole("link").filter({
        has: page.getByRole("heading", {
            name: catalogGame.title,
            exact: true,
        }),
    });

    await libraryCard.click();

    await expect(
        page.getByRole("heading", {
            name: catalogGame.title,
            exact: true,
            level: 1,
        }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Jogando", exact: true }).click();
    await page.getByRole("textbox", { name: "Horas jogadas", exact: true }).fill("12,5");
    await page.getByRole("textbox", { name: "Nota", exact: true }).fill("4,2");

    await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();

    await expect(page.getByRole("button", { name: "Salvo!" })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("button", { name: "Jogando", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await expect(page.getByRole("textbox", { name: "Horas jogadas", exact: true })).toHaveValue(
        "12,5",
    );
    await expect(page.getByRole("textbox", { name: "Nota", exact: true })).toHaveValue("4,2");
    await expect(
        page.getByRole("button", { name: "Salvar alterações", exact: true }),
    ).toBeDisabled();
});

test("deve remover um jogo da biblioteca e persistir após recarregar", async ({
    page,
    authenticatedUser: _authenticatedUser,
    catalogGame,
}) => {
    // Prepara a biblioteca usando a API real e os cookies do navegador.
    const response = await page.context().request.post(`${API_URL}/library`, {
        data: {
            externalId: catalogGame.externalId,
            status: "WANT_TO_PLAY",
            platforms: ["PC"],
        },
    });

    expect(response.status()).toBe(201);

    await page.goto("/library");

    const libraryCard = page.getByRole("link").filter({
        has: page.getByRole("heading", {
            name: catalogGame.title,
            exact: true,
        }),
    });

    await libraryCard.click();

    await expect(
        page.getByRole("heading", {
            name: catalogGame.title,
            exact: true,
            level: 1,
        }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Remover", exact: true }).click();

    const modal = page.getByRole("dialog", {
        name: "Remover da biblioteca?",
        exact: true,
    });

    await expect(modal).toBeVisible();
    await expect(modal.getByText(catalogGame.title, { exact: true })).toBeVisible();

    await modal.getByRole("button", { name: "Remover", exact: true }).click();

    await expect(page).toHaveURL(/\/library$/);
    await expect(page.getByRole("heading", { name: "Sua biblioteca está vazia" })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("heading", { name: "Sua biblioteca está vazia" })).toBeVisible();
    await expect(libraryCard).toHaveCount(0);
});
