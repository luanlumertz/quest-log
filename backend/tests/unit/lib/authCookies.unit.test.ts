import { describe, test, expect, vi, afterEach } from "vitest";
import express from "express";
import request from "supertest";

describe("Cookies de autenticação em produção", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    test("deve emitir e remover cookies Secure, HttpOnly e SameSite=None nos mesmos caminhos", async () => {
        vi.stubEnv("NODE_ENV", "production");
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

            expect(headers).toHaveLength(2);

            for (const header of headers) {
                expect(header).toContain("Secure");
                expect(header).toContain("HttpOnly");
                expect(header).toContain("SameSite=None");
            }

            expect(headers[0]).toContain("Path=/;");
            expect(headers[1]).toContain("Path=/auth;");
        }
    });
});
