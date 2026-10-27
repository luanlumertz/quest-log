import express from "express";
import request from "supertest";
import { assert, describe, test } from "vitest";
import { createCsrfProtection } from "../../../src/middlewares/csrf.middleware.js";
import { errorHandler } from "../../../src/middlewares/errorHandler.middleware.js";

const origin = "https://questlog.example";
const validHeaders = { Origin: origin, "X-QuestLog-Request": "true" };

function createApp() {
    const app = express();
    app.use(createCsrfProtection(origin));
    app.use(express.json());
    app.use((_req, res) => res.sendStatus(204));
    app.use(errorHandler);

    return app;
}

describe("csrf.middleware.ts", () => {
    test.each(["post", "put", "patch", "delete"] as const)(
        "deve permitir %s com origem autorizada, cabeçalho e JSON",
        async (method) => {
            const client = request(createApp());
            const response = await client[method]("/").set(validHeaders).send({ name: "Jogador" });

            assert.equal(response.status, 204);
        },
    );

    test.each(["get", "head", "options"] as const)(
        "deve permitir %s sem cabeçalhos CSRF",
        async (method) => {
            const response = await request(createApp())[method]("/");

            assert.equal(response.status, 204);
        },
    );

    test.each([
        { scenario: "outra origem", headers: { ...validHeaders, Origin: "https://evil.example" } },
        { scenario: "origem null", headers: { ...validHeaders, Origin: "null" } },
        {
            scenario: "subdomínio não autorizado",
            headers: { ...validHeaders, Origin: "https://sub.questlog.example" },
        },
        {
            scenario: "prefixo enganoso",
            headers: { ...validHeaders, Origin: `${origin}.evil.example` },
        },
        {
            scenario: "protocolo diferente",
            headers: { ...validHeaders, Origin: "http://questlog.example" },
        },
        { scenario: "porta diferente", headers: { ...validHeaders, Origin: `${origin}:444` } },
        { scenario: "cabeçalho ausente", headers: { Origin: origin } },
        {
            scenario: "cabeçalho incorreto",
            headers: { ...validHeaders, "X-QuestLog-Request": "false" },
        },
        { scenario: "origem e referer ausentes", headers: { "X-QuestLog-Request": "true" } },
        {
            scenario: "referer inválido",
            headers: { Referer: "invalido", "X-QuestLog-Request": "true" },
        },
        {
            scenario: "referer malicioso",
            headers: { Referer: "https://evil.example/page", "X-QuestLog-Request": "true" },
        },
        {
            scenario: "Origin malicioso com Referer permitido",
            headers: { ...validHeaders, Origin: "https://evil.example", Referer: origin },
        },
    ])("deve rejeitar $scenario", async ({ headers }) => {
        const response = await request(createApp()).post("/").set(headers).send({});

        assert.equal(response.status, 403);
        assert.equal(response.body.message, "Origem da requisição não permitida.");
    });

    test("deve aceitar Referer da origem exata quando Origin estiver ausente", async () => {
        const response = await request(createApp())
            .post("/")
            .set("Referer", `${origin}/profile?tab=password`)
            .set("X-QuestLog-Request", "true");

        assert.equal(response.status, 204);
    });

    test.each(["application/x-www-form-urlencoded", "text/plain", "multipart/form-data"])(
        "deve rejeitar corpo %s mesmo com os cabeçalhos autorizados",
        async (contentType) => {
            const response = await request(createApp())
                .post("/")
                .set(validHeaders)
                .set("Content-Type", contentType)
                .send("name=Jogador");

            assert.equal(response.status, 415);
        },
    );

    test("deve aceitar JSON com charset", async () => {
        const response = await request(createApp())
            .post("/")
            .set(validHeaders)
            .set("Content-Type", "application/json; charset=utf-8")
            .send("{}");

        assert.equal(response.status, 204);
    });
});
