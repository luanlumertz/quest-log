import express from "express";
import request from "supertest";
import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { createOriginProtection } from "../../../src/middlewares/origin.middleware.js";
import { errorHandler } from "../../../src/middlewares/errorHandler.middleware.js";

const secret = "a".repeat(64);

function createApp(key: string | undefined) {
    const app = express();
    app.use(createOriginProtection(key));
    app.use((_req, res) => res.sendStatus(204));
    app.use(errorHandler);

    return app;
}

describe("proteção da origem por chave privada", () => {
    afterEach(() => vi.unstubAllEnvs());

    test.each([undefined, "curta"])("deve impedir produção sem uma chave forte: %s", (key) => {
        vi.stubEnv("NODE_ENV", "production");

        expect(() => createApp(key)).toThrow(
            "ORIGIN_SECRET deve ter pelo menos 32 caracteres em produção.",
        );
    });

    test("deve permitir chamadas autenticadas pelo proxy em produção", async () => {
        vi.stubEnv("NODE_ENV", "production");

        const response = await request(createApp(secret))
            .post("/auth/login")
            .set("X-QuestLog-Origin-Secret", secret);

        assert.equal(response.status, 204);
    });

    test.each([undefined, "incorreta", "b".repeat(64)])(
        "deve rejeitar chave ausente ou incorreta: %s",
        async (key) => {
            const call = request(createApp(secret)).get("/auth/me");
            if (key !== undefined) call.set("X-QuestLog-Origin-Secret", key);

            const response = await call;

            assert.equal(response.status, 403);
            assert.equal(response.body.message, "Acesso à API não permitido.");
        },
    );

    test.each(["get", "head"] as const)(
        "deve manter o healthcheck %s acessível ao Render",
        async (method) => {
            const client = request(createApp(secret));

            const response = await client[method]("/healthz");

            assert.equal(response.status, 204);
        },
    );

    test("não deve liberar outros métodos pelo caminho do healthcheck", async () => {
        const response = await request(createApp(secret)).post("/healthz");

        assert.equal(response.status, 403);
    });

    test("deve permitir a API direta no desenvolvimento sem chave configurada", async () => {
        vi.stubEnv("NODE_ENV", "development");

        const response = await request(createApp(undefined)).post("/auth/login");

        assert.equal(response.status, 204);
    });

    test("deve permitir acesso público direto no sandbox sem a chave privada da produção", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("APP_ENV", "sandbox");

        const response = await request(createApp(undefined)).get("/docs");

        assert.equal(response.status, 204);
    });

    test("deve rejeitar chave de proxy configurada no sandbox de acesso direto", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("APP_ENV", "sandbox");

        expect(() => createApp(secret)).toThrow(
            "Não configure ORIGIN_SECRET no sandbox: o acesso é direto, sem o proxy privado da produção.",
        );
    });
});
