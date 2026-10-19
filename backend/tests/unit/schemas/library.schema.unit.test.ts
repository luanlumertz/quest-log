import { assert, describe, test } from "vitest";

import {
    addGameToLibrarySchema,
    gameIdParamsSchema,
    libraryQuerySchema,
    updateLibraryEntrySchema,
} from "../../../src/schemas/library.schema.js";

describe("library.schema.ts", () => {
    describe("addGameToLibrarySchema", () => {
        const validPayload = {
            externalId: 123,
            status: "WANT_TO_PLAY",
            platforms: ["PC"],
        };

        test("deve definir o status padrão e normalizar os nomes das plataformas", () => {
            const result = addGameToLibrarySchema.parse({
                externalId: 123,
                platforms: ["  PC  ", "  PlayStation 5  "],
            });

            assert.deepEqual(result, {
                externalId: 123,
                status: "WANT_TO_PLAY",
                platforms: ["PC", "PlayStation 5"],
            });
        });

        test("deve aceitar um status válido informado explicitamente", () => {
            const result = addGameToLibrarySchema.parse({
                ...validPayload,
                status: "PLAYING",
            });

            assert.deepEqual(result, {
                ...validPayload,
                status: "PLAYING",
            });
        });

        test("deve rejeitar propriedades não permitidas ao adicionar um jogo", () => {
            const result = addGameToLibrarySchema.safeParse({
                ...validPayload,
                rating: 4.5,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.code === "unrecognized_keys" && issue.keys.includes("rating"),
                ),
            );
        });

        test.each([
            {
                scenario: "externalId não positivo",
                override: { externalId: 0 },
                field: "externalId",
                message: "O externalId deve ser um número positivo",
            },
            {
                scenario: "externalId decimal",
                override: { externalId: 1.5 },
                field: "externalId",
                message: "O externalId deve ser um número inteiro",
            },
            {
                scenario: "externalId como texto",
                override: { externalId: "123" },
                field: "externalId",
                message: "O externalId deve ser um número",
            },
            {
                scenario: "status inválido",
                override: { status: "PAUSED" },
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
                scenario: "plataformas duplicadas após normalização",
                override: { platforms: ["PC", " PC "] },
                field: "platforms",
                message: "As plataformas não podem se repetir",
            },
            {
                scenario: "plataformas não enviadas como lista",
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
            const result = addGameToLibrarySchema.safeParse({
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

        test.each(["externalId", "platforms"] as const)(
            "deve rejeitar adição de jogo sem o campo %s",
            (field) => {
                const payload: Partial<typeof validPayload> = { ...validPayload };

                delete payload[field];

                const result = addGameToLibrarySchema.safeParse(payload);

                assert.isFalse(result.success);

                assert.isTrue(result.error.issues.some((issue) => issue.path[0] === field));
            },
        );
    });

    describe("gameIdParamsSchema", () => {
        test("deve converter gameId de string para number", () => {
            const result = gameIdParamsSchema.parse({ gameId: "123" });

            assert.typeOf(result.gameId, "number");
            assert.equal(result.gameId, 123);
        });

        test.each([
            {
                scenario: "gameId não positivo",
                payload: { gameId: "0" },
                message: "O gameId deve ser maior que 0",
            },
            {
                scenario: "gameId decimal",
                payload: { gameId: "1.5" },
                message: "O gameId deve ser um número inteiro",
            },
            {
                scenario: "gameId não numérico",
                payload: { gameId: "abc" },
                message: "O gameId deve ser um número",
            },
            {
                scenario: "gameId com string vazia",
                payload: { gameId: "" },
                message: "O gameId deve ser maior que 0",
            },
            {
                scenario: "gameId ausente",
                payload: {},
                message: "O gameId deve ser um número",
            },
        ])("deve rejeitar $scenario", ({ payload, message }) => {
            const result = gameIdParamsSchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === "gameId" && issue.message === message,
                ),
            );
        });
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

        test("deve rejeitar atualização sem campos", () => {
            const result = updateLibraryEntrySchema.safeParse({});

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

    describe("libraryQuerySchema", () => {
        test("deve normalizar o termo de busca removendo espaços externos", () => {
            const result = libraryQuerySchema.parse({ search: "  Elden Ring  " });

            assert.equal(result.search, "Elden Ring");
        });

        test("deve rejeitar propriedades não permitidas na consulta da biblioteca", () => {
            const result = libraryQuerySchema.safeParse({
                search: "Elden Ring",
                page: 2,
            });

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.code === "unrecognized_keys" && issue.keys.includes("page"),
                ),
            );
        });

        test.each([
            {
                scenario: "busca contendo apenas espaços",
                payload: { search: "   " },
                field: "search",
                message: "A busca não pode estar vazia",
            },
            {
                scenario: "busca com tipo inválido",
                payload: { search: 123 },
                field: "search",
                message: "A busca deve ser um texto",
            },
            {
                scenario: "status inválido",
                payload: { status: "PAUSED" },
                field: "status",
                message: "Status inválido",
            },
        ])("deve rejeitar $scenario", ({ payload, field, message }) => {
            const result = libraryQuerySchema.safeParse(payload);

            assert.isFalse(result.success);

            assert.isTrue(
                result.error.issues.some(
                    (issue) => issue.path[0] === field && issue.message === message,
                ),
            );
        });

        test.each([
            {
                scenario: "consulta sem filtros",
                payload: {},
            },
            {
                scenario: "busca e status combinados",
                payload: { search: "Elden Ring", status: "COMPLETED" },
            },
        ] as const)("deve aceitar $scenario", ({ payload }) => {
            const result = libraryQuerySchema.safeParse(payload);

            assert.isTrue(result.success);

            assert.deepEqual(result.data, payload);
        });
    });
});
