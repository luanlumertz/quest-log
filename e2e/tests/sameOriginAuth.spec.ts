import { test, expect } from "../fixtures/test.fixture";
import { createTestUser } from "../helpers/db.helper";
import { API_URL } from "../helpers/env.helper";

test("deve fazer login, renovar e sair pelo proxy com cookies de terceiros bloqueados", async ({
    page,
    context,
    testEmail,
}) => {
    const password = "SenhaTeste123!";
    await createTestUser({ email: testEmail, name: "Jogador", password });

    // Simula cookies deixados por uma versão anterior durante a troca do proxy.
    const domain = new URL(API_URL).hostname;
    await context.addCookies([
        { name: "accessToken", value: "legacy", domain, path: "/", httpOnly: true },
        { name: "refreshToken", value: "legacy", domain, path: "/auth", httpOnly: true },
    ]);

    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCookieControls", {
        enableThirdPartyCookieRestriction: true,
    });

    await page.goto("/login");
    await page.getByRole("textbox", { name: "Email", exact: true }).fill(testEmail);
    await page.getByLabel("Senha", { exact: true }).fill(password);

    const loginResponse = page.waitForResponse(`${API_URL}/auth/login`);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    const login = await loginResponse;
    expect(login.status()).toBe(200);
    expect((await login.request().allHeaders())["x-questlog-origin-secret"]).toBeUndefined();
    await expect(page).toHaveURL(/\/dashboard$/);

    const cookies = await context.cookies(API_URL);
    expect(
        (await context.cookies()).some(
            (cookie) => cookie.name === "accessToken" && cookie.path === "/",
        ),
    ).toBe(false);
    expect(
        (await context.cookies()).some(
            (cookie) => cookie.name === "refreshToken" && cookie.path === "/auth",
        ),
    ).toBe(false);
    expect(cookies.find((cookie) => cookie.name === "accessToken")).toMatchObject({
        path: "/api",
        httpOnly: true,
        sameSite: "Lax",
    });
    expect(cookies.find((cookie) => cookie.name === "refreshToken")).toBeUndefined();
    expect(
        (await context.cookies(`${API_URL}/auth/refresh`)).find(
            (cookie) => cookie.name === "refreshToken",
        ),
    ).toMatchObject({
        path: "/api/auth",
        httpOnly: true,
    });

    // Simula o fim do access token mantendo a autorização de renovação real.
    await context.clearCookies({ name: "accessToken" });
    const refreshResponse = page.waitForResponse(`${API_URL}/auth/refresh`);
    await page.reload();

    expect((await refreshResponse).status()).toBe(204);
    await expect(
        page.getByRole("heading", { name: "Bem-vindo de volta, Jogador", exact: true }),
    ).toBeVisible();

    const me = await page.evaluate(async () => {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        return { status: response.status, cacheControl: response.headers.get("cache-control") };
    });
    expect(me).toEqual({ status: 200, cacheControl: "no-store" });

    const directApi = process.env.E2E_BACKEND_URL ?? "http://localhost:3000";
    const bypass = await context.request.get(`${directApi}/auth/me`, {
        headers: { "X-Forwarded-For": "198.51.100.123" },
    });
    expect(bypass.status()).toBe(403);

    await page.goto("/profile");
    await page.getByRole("button", { name: "Sair", exact: true }).click();

    await expect(page).toHaveURL(/\/login$/);
    expect(
        (await context.cookies()).filter((cookie) =>
            ["accessToken", "refreshToken"].includes(cookie.name),
        ),
    ).toHaveLength(0);
});
