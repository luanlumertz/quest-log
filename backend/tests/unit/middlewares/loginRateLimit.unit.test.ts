import express from "express";
import request from "supertest";
import { afterEach, describe, expect, test, vi } from "vitest";

async function createLoginApp() {
    vi.resetModules();
    const { loginRateLimiter } = await import("../../../src/middlewares/rateLimit.middleware.js");
    const app = express();
    app.post("/login", loginRateLimiter, (_req, res) => res.sendStatus(401));
    return app;
}

describe("isolamento do limite de login nos E2E", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    test("deve separar os testes e manter o limite dentro do mesmo teste", async () => {
        vi.stubEnv("E2E_MODE", "true");
        vi.stubEnv("NODE_ENV", "test");
        vi.stubEnv("DATABASE_URL", "postgresql://localhost/quest_log_e2e");
        const app = await createLoginApp();

        for (let attempt = 0; attempt < 10; attempt++) {
            const response = await request(app).post("/login").set("X-E2E-Test-ID", "teste-a");
            expect(response.status).toBe(401);
        }

        const blocked = await request(app).post("/login").set("X-E2E-Test-ID", "teste-a");
        const nextTest = await request(app).post("/login").set("X-E2E-Test-ID", "teste-b");

        expect(blocked.status).toBe(429);
        expect(nextTest.status).toBe(401);
    });

    test("deve manter o limite por IP quando o E2E não enviar identificador", async () => {
        vi.stubEnv("E2E_MODE", "true");
        vi.stubEnv("NODE_ENV", "test");
        vi.stubEnv("DATABASE_URL", "postgresql://localhost/quest_log_e2e");
        const app = await createLoginApp();

        for (let attempt = 0; attempt < 10; attempt++) {
            expect((await request(app).post("/login")).status).toBe(401);
        }

        expect((await request(app).post("/login")).status).toBe(429);
    });

    test.each([
        {
            scenario: "modo normal",
            mode: undefined,
            nodeEnv: "development",
            database: "quest_log_e2e",
        },
        { scenario: "produção", mode: "true", nodeEnv: "production", database: "quest_log_e2e" },
        { scenario: "outro banco", mode: "true", nodeEnv: "test", database: "quest_log_test" },
        { scenario: "banco não configurado", mode: "true", nodeEnv: "test", database: undefined },
    ])("deve ignorar o identificador em $scenario", async ({ mode, nodeEnv, database }) => {
        vi.stubEnv("E2E_MODE", mode);
        vi.stubEnv("NODE_ENV", nodeEnv);
        vi.stubEnv("DATABASE_URL", database ? `postgresql://localhost/${database}` : undefined);
        const app = await createLoginApp();

        for (let attempt = 0; attempt < 10; attempt++) {
            const response = await request(app)
                .post("/login")
                .set("X-E2E-Test-ID", `teste-${attempt}`);
            expect(response.status).toBe(401);
        }

        const response = await request(app).post("/login").set("X-E2E-Test-ID", "outro-teste");

        expect(response.status).toBe(429);
    });
});
