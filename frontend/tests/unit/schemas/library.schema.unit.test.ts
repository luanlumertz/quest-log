import { assert, describe, test } from "vitest";

import {
    addGameToLibraryFormSchema,
    updateLibraryEntrySchema,
} from "../../../src/schema/library.schema";

describe("library.schema.test.ts", () => {
    describe("addGameToLibraryFormSchema", () => {
        const validPayload = {
            status: "WANT_TO_PLAY",
            platforms: ["PC"],
        };

        test("deve aceitar status válido e normalizar os nomes das plataformas", () => {
            const result = addGameToLibraryFormSchema.parse({
                status: "WANT_TO_PLAY",
                platforms: ["  PC  "],
            });

            assert.deepEqual(result, {
                status: "WANT_TO_PLAY",
                platforms: ["PC"],
            });
        });

        test("deve aceitar múltiplas plataformas diferentes", () => {
            const result = addGameToLibraryFormSchema.parse({
                status: "PLAYING",
                platforms: ["PC", "PlayStation 5", "Xbox Series X"],
            });

            assert.deepEqual(result, {
                status: "PLAYING",
                platforms: ["PC", "PlayStation 5", "Xbox Series X"],
            });
        });

        test("deve rejeitar propriedades não permitidas ao adicionar um jogo", () => {
            const result = addGameToLibraryFormSchema.safeParse({
                ...validPayload,
                externalId: 123,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) =>
                        issue.code === "unrecognized_keys" && issue.keys.includes("externalId"),
                ),
            );
        });

        test.each([
            {
                scenario: "status inválido",
                override: { status: "INVALID" },
                field: "status",
                message: "Status inválido",
            },
            {
                scenario: "lista de plataformas vazia",
                override: { platforms: [] },
                field: "platforms",
                message: "Informe pelo menos uma plataforma",
            },
            {
                scenario: "plataforma contendo apenas espaços",
                override: { platforms: ["   "] },
                field: "platforms",
                message: "A plataforma não pode estar vazia",
            },
            {
                scenario: "plataformas duplicadas",
                override: { platforms: ["PC", " PC "] },
                field: "platforms",
                message: "As plataformas não podem se repetir",
            },
            {
                scenario: "plataformas fora de uma lista",
                override: { platforms: "PC" },
                field: "platforms",
                message: "As plataformas devem ser enviadas em uma lista",
            },
            {
                scenario: "plataforma com tipo inválido",
                override: { platforms: [123] },
                field: "platforms",
                message: "A plataforma deve ser um texto",
            },
        ])("deve rejeitar $scenario", ({ override, field, message }) => {
            const result = addGameToLibraryFormSchema.safeParse({
                ...validPayload,
                ...override,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === field && issue.message === message,
                ),
            );
        });

        test.each(["status", "platforms"] as const)(
            "deve rejeitar adição de jogo sem o campo %s",
            (field) => {
                const payload: Partial<typeof validPayload> = { ...validPayload };

                delete payload[field];

                const result = addGameToLibraryFormSchema.safeParse(payload);

                assert.isFalse(result.success);

                assert.isTrue(result.error.issues.some((issue) => issue.path[0] === field));
            },
        );
    });

    describe("updateLibraryEntrySchema", () => {
        test("deve converter startedAt e completedAt de string para Date", () => {
            const result = updateLibraryEntrySchema.parse({
                startedAt: "2026-01-10T12:00:00.000Z",
                completedAt: "2026-02-10T18:30:00.000Z",
            });

            assert.instanceOf(result.startedAt, Date);
            assert.instanceOf(result.completedAt, Date);
            assert.equal(result.startedAt.toISOString(), "2026-01-10T12:00:00.000Z");
            assert.equal(result.completedAt.toISOString(), "2026-02-10T18:30:00.000Z");
        });

        test.each([
            {
                scenario: "nenhum campo informado",
                payload: {},
            },
            {
                scenario: "campo com valor undefined",
                payload: { rating: undefined },
            },
        ])("deve rejeitar atualização com $scenario", ({ payload }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) =>
                        issue.message === "Pelo menos um campo deve ser informado para atualização",
                ),
            );
        });

        test("deve rejeitar propriedades não permitidas na atualização", () => {
            const result = updateLibraryEntrySchema.safeParse({
                status: "PLAYING",
                externalId: 123,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) =>
                        issue.code === "unrecognized_keys" && issue.keys.includes("externalId"),
                ),
            );
        });

        test("deve rejeitar status inválido", () => {
            const result = updateLibraryEntrySchema.safeParse({ status: "PAUSED" });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "status" && issue.message === "Status inválido",
                ),
            );
        });

        test.each([
            {
                scenario: "status WANT_TO_PLAY",
                payload: { status: "WANT_TO_PLAY" },
            },
            {
                scenario: "status PLAYING",
                payload: { status: "PLAYING" },
            },
            {
                scenario: "status COMPLETED",
                payload: { status: "COMPLETED" },
            },
            {
                scenario: "status ABANDONED",
                payload: { status: "ABANDONED" },
            },
        ])("deve aceitar $scenario", ({ payload }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.equal(result.data.status, payload.status);
        });

        test.each([
            {
                scenario: "rating negativo",
                payload: { rating: -0.1 },
                message: "A nota deve ser no mínimo 0",
            },
            {
                scenario: "rating acima de 5",
                payload: { rating: 5.1 },
                message: "A nota deve ser no máximo 5",
            },
            {
                scenario: "rating com mais de uma casa decimal",
                payload: { rating: 3.25 },
                message: "A nota deve ter no máximo uma casa decimal",
            },
            {
                scenario: "rating como texto",
                payload: { rating: "4.5" },
                message: "O rating deve ser um número",
            },
        ])("deve rejeitar $scenario", ({ payload, message }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "rating" && issue.message === message,
                ),
            );
        });

        test.each([
            {
                scenario: "rating mínimo",
                payload: { rating: 0 },
            },
            {
                scenario: "rating máximo",
                payload: { rating: 5 },
            },
            {
                scenario: "rating decimal válido",
                payload: { rating: 3.9 },
            },
            {
                scenario: "rating nulo",
                payload: { rating: null },
            },
        ])("deve aceitar $scenario", ({ payload }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.equal(result.data.rating, payload.rating);
        });

        test.each([
            {
                scenario: "tempo jogado negativo",
                payload: { playtimeMinutes: -1 },
                message: "O playtimeMinutes deve ser no mínimo 0",
            },
            {
                scenario: "tempo jogado decimal",
                payload: { playtimeMinutes: 1.5 },
                message: "O playtimeMinutes deve ser um número inteiro",
            },
            {
                scenario: "tempo jogado como texto",
                payload: { playtimeMinutes: "120" },
                message: "O playtimeMinutes deve ser um número",
            },
        ])("deve rejeitar $scenario", ({ payload, message }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "playtimeMinutes" && issue.message === message,
                ),
            );
        });

        test.each([
            {
                scenario: "tempo jogado igual a 0",
                payload: { playtimeMinutes: 0 },
            },
            {
                scenario: "tempo jogado inteiro positivo",
                payload: { playtimeMinutes: 120 },
            },
        ])("deve aceitar $scenario", ({ payload }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.equal(result.data.playtimeMinutes, payload.playtimeMinutes);
        });

        test.each([
            {
                scenario: "lista de plataformas vazia",
                payload: { platforms: [] },
                message: "Informe pelo menos uma plataforma",
            },
            {
                scenario: "plataformas duplicadas",
                payload: { platforms: [1, 1] },
                message: "As plataformas não podem se repetir",
            },
            {
                scenario: "plataformas não enviadas como lista",
                payload: { platforms: "PC" },
                message: "As plataformas devem ser enviadas em uma lista",
            },
            {
                scenario: "ID de plataforma igual a zero",
                payload: { platforms: [0] },
                message: "O id da plataforma deve ser maior que 0",
            },
            {
                scenario: "ID de plataforma decimal",
                payload: { platforms: [1.5] },
                message: "O id da plataforma deve ser um número inteiro",
            },
            {
                scenario: "ID de plataforma como texto",
                payload: { platforms: ["1"] },
                message: "O id da plataforma deve ser um número",
            },
        ])("deve rejeitar $scenario", ({ payload, message }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "platforms" && issue.message === message,
                ),
            );
        });

        test.each([
            {
                scenario: "uma plataforma válida",
                payload: { platforms: [1] },
            },
            {
                scenario: "múltiplas plataformas válidas",
                payload: { platforms: [1, 2, 3] },
            },
        ])("deve aceitar $scenario", ({ payload }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.deepEqual(result.data.platforms, payload.platforms);
        });

        test.each([
            {
                scenario: "data de início inválida",
                payload: { startedAt: "data-invalida" },
                field: "startedAt",
                message: "A data de início deve ser uma data válida",
            },
            {
                scenario: "data de conclusão inválida",
                payload: { completedAt: "data-invalida" },
                field: "completedAt",
                message: "A data de conclusão deve ser uma data válida",
            },
        ])("deve rejeitar $scenario", ({ payload, field, message }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === field && issue.message === message,
                ),
            );
        });

        test.each([
            {
                scenario: "data de início nula",
                payload: { startedAt: null },
            },
            {
                scenario: "data de conclusão nula",
                payload: { completedAt: null },
            },
        ])("deve aceitar $scenario", ({ payload }) => {
            const result = updateLibraryEntrySchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.deepEqual(result.data, payload);
        });
    });
});
