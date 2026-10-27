import { test, expect } from "../fixtures/test.fixture";

test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
});

test("deve navegar pela barra mobile e impedir acesso após sair", async ({
    page,
    authenticatedUser: _authenticatedUser,
}) => {
    await page.goto("/dashboard");

    const navigation = page.getByRole("navigation");

    await expect(page.locator("header")).toBeHidden();
    await expect(navigation).toBeVisible();
    await expect(
        navigation.getByRole("link", { name: "Visão Geral", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    const destinations = [
        { label: "Biblioteca", path: "/library", heading: "Minha Biblioteca" },
        { label: "Pesquisar", path: "/games/search", heading: "Procurar Jogos" },
        { label: "Perfil", path: "/profile", heading: "Meu Perfil" },
    ];

    for (const destination of destinations) {
        const link = navigation.getByRole("link", { name: destination.label, exact: true });

        await expect(link).toBeInViewport();

        await link.tap();

        await expect(page).toHaveURL(destination.path);
        await expect(
            page.getByRole("heading", { name: destination.heading, exact: true, level: 1 }),
        ).toBeVisible();
        await expect(link).toHaveAttribute("aria-current", "page");
    }

    await page.getByRole("button", { name: "Sair", exact: true }).tap();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Bem-vindo!", exact: true })).toBeVisible();
    await expect(navigation).toHaveCount(0);

    // Confirma que o logout também bloqueia uma nova navegação direta.
    await page.goto("/library");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Bem-vindo!", exact: true })).toBeVisible();
});
