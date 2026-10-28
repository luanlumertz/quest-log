import { test, expect } from "../fixtures/test.fixture";
import { createTestUser } from "../helpers/db.helper";
import { MAILPIT_URL } from "../helpers/env.helper";

test("deve recuperar a senha e permitir login somente com a nova", async ({
    page,
    request,
    testEmail,
}) => {
    test.setTimeout(60_000);

    const oldPassword = "SenhaTeste123!";
    const newPassword = "NovaSenha456!";

    // Prepara a conta sem autenticar o navegador.
    await createTestUser({
        name: "Jogador E2E",
        email: testEmail,
        password: oldPassword,
    });

    await page.goto("/login");
    await page.getByRole("link", { name: "Esqueceu sua senha?" }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    // A URL pode mudar antes de o React substituir o formulário de login.
    await expect(
        page.getByRole("heading", { name: "Esqueceu sua senha?", exact: true }),
    ).toBeVisible();

    const emailInput = page.getByRole("textbox", { name: "Email", exact: true });

    await emailInput.fill(testEmail);

    await expect(emailInput).toHaveValue(testEmail);
    await page.getByRole("button", { name: "Enviar código", exact: true }).click();

    await expect(page).toHaveURL(/\/forgot-password\/verify$/);

    // Aguarda o código enviado para o destinatário exclusivo deste teste.
    let code = "";

    await expect
        .poll(
            async () => {
                const response = await request.get(`${MAILPIT_URL}/view/latest.txt`, {
                    params: { query: `to:${testEmail}` },
                });

                if (!response.ok()) return "";

                const message = await response.text();

                code = message.match(/Seu código para recuperar a senha é (\d{6})\./)?.[1] ?? "";

                return code;
            },
            { timeout: 20_000 },
        )
        .toMatch(/^\d{6}$/);

    await page.getByRole("textbox", { name: "Código de verificação", exact: true }).fill(code);
    await page.getByRole("button", { name: "Confirmar código", exact: true }).click();

    await expect(page).toHaveURL(/\/forgot-password\/reset$/);

    await page.getByLabel("Nova senha", { exact: true }).fill(newPassword);
    await page.getByLabel("Confirme a nova senha", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Salvar nova senha", exact: true }).click();

    await expect(page).toHaveURL(/\/login$/);

    // A senha antiga deve ser recusada.
    await page.getByRole("textbox", { name: "Email", exact: true }).fill(testEmail);
    await page.getByLabel("Senha", { exact: true }).fill(oldPassword);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page.getByText("Email ou senha inválidos", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    // A nova senha deve autenticar o usuário.
    await page.getByLabel("Senha", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Bem-vindo de volta, Jogador" })).toBeVisible();
});
