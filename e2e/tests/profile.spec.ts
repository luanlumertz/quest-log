import { test, expect } from "../fixtures/test.fixture";
import { API_URL } from "../helpers/env.helper";

test("deve alterar o nome e persistir a atualização após recarregar", async ({
    page,
    authenticatedUser: _authenticatedUser,
}) => {
    const newName = "Ana Jogadora";

    await page.goto("/profile");

    const main = page.getByRole("main");
    const header = page.getByRole("banner");

    await main.getByRole("button", { name: "Editar", exact: true }).click();
    await main.getByRole("textbox", { name: "Nome de exibição", exact: true }).fill(newName);
    await main.getByRole("button", { name: "Salvar", exact: true }).click();

    // Confirma a atualização na tela atual e no contexto de autenticação.
    await expect(main.getByText(newName, { exact: true })).toBeVisible();
    await expect(header.getByText(newName, { exact: true })).toBeVisible();

    // Navega sem recarregar para conferir a sincronização entre telas.
    await header.getByRole("link", { name: "Visão Geral", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    const greeting = page.getByRole("heading", { name: "Bem-vindo de volta, Ana", exact: true });

    await expect(greeting).toBeVisible();

    // Elimina o estado em memória e confirma a persistência.
    await page.reload();

    await expect(greeting).toBeVisible();
    await expect(header.getByText(newName, { exact: true })).toBeVisible();
});

test("deve trocar a senha, manter a sessão atual e encerrar as outras", async ({
    page,
    browser,
    baseURL,
    extraHTTPHeaders,
    authenticatedUser,
}) => {
    test.setTimeout(60_000);

    const newPassword = "NovaSenha456!";

    // Simula outro navegador, com cookies independentes.
    const otherContext = await browser.newContext({
        baseURL,
        extraHTTPHeaders,
    });

    try {
        // Autentica a mesma conta nesse segundo navegador.
        const login = await otherContext.request.post(`${API_URL}/auth/login`, {
            data: {
                email: authenticatedUser.email,
                password: authenticatedUser.password,
            },
        });

        expect(login.status()).toBe(200);

        const otherPage = await otherContext.newPage();

        await otherPage.goto("/dashboard");

        await expect(
            otherPage.getByRole("heading", { name: "Bem-vindo de volta, Jogador", exact: true }),
        ).toBeVisible();

        // Troca a senha pela interface do navegador principal.
        await page.goto("/profile");

        await page.getByRole("button", { name: "Alterar senha", exact: true }).click();
        await page.getByLabel("Senha atual", { exact: true }).fill(authenticatedUser.password);
        await page.getByLabel("Nova senha", { exact: true }).fill(newPassword);
        await page.getByLabel("Confirme a nova senha", { exact: true }).fill(newPassword);

        await page.getByRole("button", { name: "Salvar nova senha", exact: true }).click();

        // O alerta recolhido continua no DOM; o role respeita seu aria-hidden.
        await expect(
            page.getByRole("status").filter({ hasText: "Senha alterada com sucesso!" }),
        ).toBeVisible();

        // A sessão atual continua válida após recarregar.
        await page.reload();

        await expect(page.getByRole("heading", { name: "Meu Perfil", exact: true })).toBeVisible();

        // A segunda sessão deve perder o acesso.
        await otherPage.reload();

        await expect(otherPage).toHaveURL(/\/login$/);

        // A senha antiga deve ser recusada.
        await otherPage
            .getByRole("textbox", { name: "Email", exact: true })
            .fill(authenticatedUser.email);
        await otherPage.getByLabel("Senha", { exact: true }).fill(authenticatedUser.password);
        await otherPage.getByRole("button", { name: "Entrar", exact: true }).click();

        await expect(
            otherPage.getByText("Email ou senha inválidos", { exact: true }),
        ).toBeVisible();

        // A nova senha deve permitir o login.
        await otherPage.getByLabel("Senha", { exact: true }).fill(newPassword);
        await otherPage.getByRole("button", { name: "Entrar", exact: true }).click();

        await expect(otherPage).toHaveURL(/\/dashboard$/);
    } finally {
        await otherContext.close();
    }
});

test("deve excluir a conta e impedir novos acessos", async ({ page, authenticatedUser }) => {
    await page.goto("/profile");

    await page.getByRole("button", { name: "Excluir conta", exact: true }).click();

    const modal = page.getByRole("dialog", { name: "Excluir conta?", exact: true });

    await expect(modal).toBeVisible();

    await modal.getByRole("button", { name: "Excluir conta", exact: true }).click();

    // A exclusão encerra a sessão.
    await expect(page).toHaveURL(/\/login$/);

    // Uma nova navegação também não permite acessar o perfil.
    await page.goto("/profile");

    await expect(page).toHaveURL(/\/login$/);

    // As credenciais da conta excluída deixam de funcionar.
    await page.getByRole("textbox", { name: "Email", exact: true }).fill(authenticatedUser.email);
    await page.getByLabel("Senha", { exact: true }).fill(authenticatedUser.password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page.getByText("Email ou senha inválidos", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
});
