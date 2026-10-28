import { expect, type Page } from "@playwright/test";
import { createTestUser } from "./db.helper";
import { API_URL, API_REQUEST_HEADERS } from "./env.helper";

export async function createAuthenticatedUser(page: Page, email: string) {
    const request = page.context().request;

    const name = "Jogador E2E";
    const password = "SenhaTeste123!";

    // Prepara a conta sem consumir o limite de cadastro ou enviar e-mail.
    await createTestUser({ name, email, password });

    // O login real salva os cookies no mesmo contexto usado pelo navegador.
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
        headers: API_REQUEST_HEADERS,
        data: { email, password },
    });

    expect(loginResponse.status()).toBe(200);

    return { name, email, password };
}
