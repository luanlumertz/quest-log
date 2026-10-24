import { assert, describe, test } from "vitest";

import { getRawgGameSchema, searchGameSchema } from "../../../src/schemas/game.schema.js";

describe("game.schema.ts", () => {
    describe("searchGameSchema", () => {
        test("deve normalizar o termo de busca removendo espaços externos", () => {
            const result = searchGameSchema.parse({ query: "  Elden Ring  " });

            assert.equal(result.query, "Elden Ring");
        });

        test("deve rejeitar busca sem o campo query", () => {
            const result = searchGameSchema.safeParse({});

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) =>
                        issue.path[0] === "query" &&
                        issue.message === "O termo de busca deve ser um texto",
                ),
            );
        });

        test.each([
            {
                scenario: "busca vazia",
                payload: { query: "" },
                message: "Informe um termo para busca",
            },
            {
                scenario: "busca com tipo inválido",
                payload: { query: 123 },
                message: "O termo de busca deve ser um texto",
            },
        ])("deve rejeitar $scenario", ({ payload, message }) => {
            const result = searchGameSchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "query" && issue.message === message,
                ),
            );
        });
    });

    describe("paginação da busca", () => {
        test("deve usar a primeira página por padrão e aceitar busca de um caractere", () => {
            const result = searchGameSchema.parse({ query: "a" });

            assert.deepEqual(result, { query: "a", page: 1 });
        });

        test("deve converter a página recebida pela URL", () => {
            const result = searchGameSchema.parse({ query: "gta", page: "2", page_size: "1000" });

            assert.deepEqual(result, { query: "gta", page: 2 });
        });

        test.each(["0", "-1", "1.5", "abc", "", " ", "Infinity", ["2", "3"], { page: 2 }, true])(
            "deve rejeitar página inválida %j",
            (page) => {
                const result = searchGameSchema.safeParse({ query: "gta", page });

                assert.isFalse(result.success);
                assert.isTrue(result.error.issues.some((issue) => issue.path[0] === "page"));
            },
        );
    });

    describe("getRawgGameSchema", () => {
        test("deve converter externalId de string para number", () => {
            const result = getRawgGameSchema.parse({ externalId: "123" });

            assert.typeOf(result.externalId, "number");
            assert.equal(result.externalId, 123);
        });

        test("deve rejeitar requisição sem o campo externalId", () => {
            const result = getRawgGameSchema.safeParse({});

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) =>
                        issue.path[0] === "externalId" &&
                        issue.message === "Deve ser informado um id válido",
                ),
            );
        });

        test.each([
            {
                scenario: "ID não positivo",
                payload: { externalId: "0" },
                message: "O id deve ser um número positivo",
            },
            {
                scenario: "ID decimal",
                payload: { externalId: "1.5" },
                message: "O id deve ser um número inteiro",
            },
            {
                scenario: "ID não numérico",
                payload: { externalId: "abc" },
                message: "Deve ser informado um id válido",
            },
        ])("deve rejeitar $scenario", ({ payload, message }) => {
            const result = getRawgGameSchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "externalId" && issue.message === message,
                ),
            );
        });
    });
});
