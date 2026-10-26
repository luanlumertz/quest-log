import { test, expect } from "../fixtures/test.fixture";
import { MAILPIT_URL } from "../helpers/env.helper";

test("deve redirecionar usuários não autenticados para o login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);

    await expect(page.getByRole("heading", { name: "Bem-vindo!" })).toBeVisible();
});

test("deve cadastrar e autenticar usuário após confirmar o e-mail", async ({
    page,
    request,
    testEmail,
}) => {
    const email = testEmail;
    const password = "SenhaTeste123!";

    await page.goto("/register");

    await page.getByRole("textbox", { name: "Nome de exibição" }).fill("Jogador E2E");
    await page.getByRole("textbox", { name: "Email" }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByLabel("Confirme sua senha").fill(password);

    await page.getByRole("button", { name: "Cadastrar" }).click();

    await expect(page).toHaveURL(/\/register\/verify$/);

    await expect(page.getByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();

    // Aguarda o e-mail de verificação chegar ao Mailpit.
    let code = "";

    await expect
        .poll(
            async () => {
                const response = await request.get(`${MAILPIT_URL}/view/latest.txt`, {
                    params: { query: `to:${email}` },
                });

                if (!response.ok()) return "";

                const message = await response.text();

                code = message.match(/Seu código de verificação é (\d{6})\./)?.[1] ?? "";

                return code;
            },
            {
                timeout: 20_000,
            },
        )
        .toMatch(/^\d{6}$/);

    await page
        .getByRole("textbox", {
            name: "Código de verificação",
        })
        .fill(code);

    await page
        .getByRole("button", {
            name: "Confirmar e criar conta",
        })
        .click();

    await expect(page).toHaveURL(/\/login$/);

    // Confirma que o usuário criado consegue entrar.
    await page.getByRole("textbox", { name: "Email" }).fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);

    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(
        page.getByRole("heading", {
            name: "Bem-vindo de volta, Jogador",
        }),
    ).toBeVisible();
});
