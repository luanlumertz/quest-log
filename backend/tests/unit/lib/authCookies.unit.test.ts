import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

describe("Cookies de autenticação", () => {
    beforeEach(() => vi.stubEnv("APP_ENV", undefined));
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    test.each([
        {
            environment: "production",
            prefix: undefined,
            accessPath: "/api",
            refreshPath: "/api/auth",
            secure: true,
        },
        {
            environment: "production",
            appEnvironment: "sandbox",
            prefix: undefined,
            accessPath: "/",
            refreshPath: "/auth",
            secure: true,
        },
        {
            environment: "test",
            prefix: undefined,
            accessPath: "/",
            refreshPath: "/auth",
            secure: false,
        },
        {
            environment: "test",
            prefix: "/api",
            accessPath: "/api",
            refreshPath: "/api/auth",
            secure: false,
        },
    ])(
        "deve emitir e remover cookies nos mesmos caminhos em $environment com prefixo $prefix",
        async ({ environment, appEnvironment, prefix, accessPath, refreshPath, secure }) => {
            vi.stubEnv("NODE_ENV", environment);
            vi.stubEnv("APP_ENV", appEnvironment);
            vi.stubEnv("AUTH_COOKIE_PATH_PREFIX", prefix);
            vi.resetModules();

            const cookies = await import("../../../src/lib/authCookies.js");
            const app = express();

            app.get("/set", (_req, res) => {
                cookies.setAccessTokenCookie(res, "access");
                cookies.setRefreshTokenCookie(res, "refresh");
                res.sendStatus(200);
            });

            app.get("/clear", (_req, res) => {
                cookies.clearAccessTokenCookie(res);
                cookies.clearRefreshTokenCookie(res);
                res.sendStatus(200);
            });

            for (const route of ["/set", "/clear"]) {
                const response = await request(app).get(route);
                const headers = response.headers["set-cookie"] as unknown as string[];

                expect(headers).toHaveLength(accessPath === "/api" ? 4 : 2);

                for (const header of headers) {
                    expect(header.includes("Secure")).toBe(secure);
                    expect(header).toContain("HttpOnly");
                    expect(header).toContain("SameSite=Lax");
                    expect(header).not.toContain("Domain=");
                }

                expect(
                    headers.some(
                        (header) =>
                            header.startsWith("accessToken=") &&
                            header.includes(`Path=${accessPath};`),
                    ),
                ).toBe(true);
                expect(
                    headers.some(
                        (header) =>
                            header.startsWith("refreshToken=") &&
                            header.includes(`Path=${refreshPath};`),
                    ),
                ).toBe(true);

                if (accessPath === "/api") {
                    expect(headers).toEqual(
                        expect.arrayContaining([
                            expect.stringContaining("accessToken=; Path=/;"),
                            expect.stringContaining("refreshToken=; Path=/auth;"),
                        ]),
                    );
                }
            }
        },
    );

    test("deve rejeitar prefixo de cookies inválido", async () => {
        vi.stubEnv("AUTH_COOKIE_PATH_PREFIX", "api/");
        vi.resetModules();

        await expect(import("../../../src/lib/authCookies.js")).rejects.toThrow(
            "AUTH_COOKIE_PATH_PREFIX deve ser vazio ou /api.",
        );
    });

    test("deve impedir cookies com prefixo /api no sandbox de acesso direto", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("APP_ENV", "sandbox");
        vi.stubEnv("AUTH_COOKIE_PATH_PREFIX", "/api");
        vi.resetModules();

        await expect(import("../../../src/lib/authCookies.js")).rejects.toThrow(
            "AUTH_COOKIE_PATH_PREFIX deve ser vazio no sandbox, pois a API usa caminhos diretos.",
        );
    });
});
