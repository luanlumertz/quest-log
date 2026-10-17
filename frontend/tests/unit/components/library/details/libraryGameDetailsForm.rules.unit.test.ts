import { assert, describe, test } from "vitest";

import type { LibraryEntryDetails } from "../../../../../src/types/library.types";
import {
    applyStatusRules,
    createDefaultValues,
    createUpdateCandidate,
    createValuesForStatus,
    getDateValidationError,
    getFieldsClearedOnSave,
    type LibraryGameDetailsFormValues,
} from "../../../../../src/components/library/details/libraryGameDetailsForm.rules";

describe("libraryGameDetailsForm.rules.ts", () => {
    const baseFormValues: LibraryGameDetailsFormValues = {
        status: "COMPLETED",
        rating: "4,5",
        playtimeHours: "12",
        platforms: [1],
        startedAt: "2026-01-01",
        completedAt: "2026-01-02",
    };

    const baseLibraryEntry: LibraryEntryDetails = {
        rating: 4.5,
        platforms: [{ id: 1, name: "PC" }],
        status: "PLAYING",
        playtimeMinutes: 720,
        startedAt: "2026-01-01",
        completedAt: null,
        createdAt: "2025-01-01T12:00:00.000Z",
        updatedAt: "2025-01-12T12:00:00.000Z",
        game: {
            id: 1,
            externalId: 123,
            title: "Elden Ring",
            coverUrl: "https://example.com/elden-ring.jpg",
            releaseDate: "2022-02-25",
        },
        availablePlatforms: [
            { id: 1, name: "PC" },
            { id: 2, name: "PlayStation 5" },
            { id: 3, name: "Xbox Series X" },
        ],
    };

    describe("applyStatusRules", () => {
        test.each([
            {
                status: "WANT_TO_PLAY",
                expected: {
                    rating: "",
                    startedAt: "",
                    completedAt: "",
                },
            },
            {
                status: "PLAYING",
                expected: {
                    completedAt: "",
                },
            },
            {
                status: "COMPLETED",
                expected: {},
            },
            {
                status: "ABANDONED",
                expected: {
                    completedAt: "",
                },
            },
        ] as const)("deve aplicar as regras do status $status", ({ status, expected }) => {
            const values = { ...baseFormValues, status };

            const result = applyStatusRules(values, "2026-01-03");

            assert.deepEqual(result, {
                ...values,
                ...expected,
            });
        });

        test.each([
            {
                status: "PLAYING",
                field: "startedAt",
            },
            {
                status: "COMPLETED",
                field: "completedAt",
            },
        ] as const)("deve preencher $field com a data atual para $status", ({ status, field }) => {
            const values = {
                ...baseFormValues,
                status,
                [field]: "",
            };

            const result = applyStatusRules(values, "2026-01-03");

            assert.equal(result[field], "2026-01-03");
        });
    });

    describe("getDateValidationError", () => {
        test.each([
            {
                scenario: "início no futuro",
                override: {
                    status: "PLAYING" as const,
                    startedAt: "2026-01-02",
                    completedAt: "",
                },
                today: "2026-01-01",
                expected: {
                    field: "startedAt",
                    message: "A data de início não pode estar no futuro",
                },
            },
            {
                scenario: "conclusão no futuro",
                override: {
                    status: "COMPLETED" as const,
                    completedAt: "2026-01-03",
                },
                today: "2026-01-02",
                expected: {
                    field: "completedAt",
                    message: "A data de conclusão não pode estar no futuro",
                },
            },
            {
                scenario: "conclusão anterior ao início",
                override: {
                    status: "COMPLETED" as const,
                    startedAt: "2026-01-02",
                    completedAt: "2026-01-01",
                },
                today: "2026-01-03",
                expected: {
                    field: "completedAt",
                    message: "A data de conclusão não pode ser anterior à data de início",
                },
            },
        ])("deve rejeitar data de $scenario", ({ override, today, expected }) => {
            const payload = {
                ...baseFormValues,
                ...override,
            };

            const result = getDateValidationError(payload, today);

            assert.deepEqual(result, expected);
        });

        test.each([
            {
                scenario: "datas em ordem cronológica",
                override: {},
                today: "2026-01-03",
            },
            {
                scenario: "início e conclusão no mesmo dia",
                override: {
                    status: "COMPLETED" as const,
                    startedAt: "2026-01-02",
                    completedAt: "2026-01-02",
                },
                today: "2026-01-03",
            },
            {
                scenario: "jogo em andamento",
                override: {
                    status: "PLAYING" as const,
                    completedAt: "",
                },
                today: "2026-01-03",
            },
        ])("deve aceitar $scenario", ({ override, today }) => {
            const values = {
                ...baseFormValues,
                ...override,
            };

            const result = getDateValidationError(values, today);

            assert.isNull(result);
        });
    });

    describe("getFieldsClearedOnSave", () => {
        test.each([
            {
                scenario: "remoção da avaliação",
                override: {},
                data: { rating: null },
                expected: ["rating"],
            },
            {
                scenario: "remoção do tempo jogado",
                override: {},
                data: { playtimeMinutes: 0 },
                expected: ["playtimeMinutes"],
            },
            {
                scenario: "remoção da data de início",
                override: {},
                data: { startedAt: null },
                expected: ["startedAt"],
            },
            {
                scenario: "remoção da data de conclusão",
                override: { completedAt: "2026-01-02" },
                data: { completedAt: null },
                expected: ["completedAt"],
            },
            {
                scenario: "remoção de múltiplos campos simultaneamente",
                override: { completedAt: "2026-01-02" },
                data: {
                    rating: null,
                    playtimeMinutes: 0,
                    startedAt: null,
                    completedAt: null,
                },
                expected: ["rating", "playtimeMinutes", "startedAt", "completedAt"],
            },
            {
                scenario: "nenhum campo removido",
                override: {},
                data: {
                    rating: 4.5,
                    playtimeMinutes: 720,
                },
                expected: [],
            },
        ])("deve identificar $scenario", ({ override, data, expected }) => {
            const entry = {
                ...baseLibraryEntry,
                ...override,
            };

            const result = getFieldsClearedOnSave(entry, data);

            assert.deepEqual(result, expected);
        });
    });

    describe("createDefaultValues", () => {
        test.each([
            {
                scenario: "um jogo em andamento",
                override: {},
                today: "2026-01-02",
                expected: {
                    status: "PLAYING" as const,
                    rating: "4,5",
                    playtimeHours: "12",
                    platforms: [1],
                    startedAt: "2026-01-01",
                    completedAt: "",
                },
            },
            {
                scenario: "um jogo sem dados preenchidos",
                override: {
                    status: "WANT_TO_PLAY" as const,
                    rating: null,
                    playtimeMinutes: 0,
                    platforms: [],
                    startedAt: null,
                    completedAt: null,
                },
                today: "2026-01-02",
                expected: {
                    status: "WANT_TO_PLAY" as const,
                    rating: "",
                    playtimeHours: "",
                    platforms: [],
                    startedAt: "",
                    completedAt: "",
                },
            },
            {
                scenario: "um jogo em andamento sem data de início",
                override: {
                    status: "PLAYING" as const,
                    startedAt: null,
                },
                today: "2026-01-02",
                expected: {
                    status: "PLAYING" as const,
                    rating: "4,5",
                    playtimeHours: "12",
                    platforms: [1],
                    startedAt: "2026-01-02",
                    completedAt: "",
                },
            },
        ])(
            "deve converter corretamente $scenario para os valores do formulário",
            ({ today, override, expected }) => {
                const entry = {
                    ...baseLibraryEntry,
                    ...override,
                };

                const result = createDefaultValues(entry, today);

                assert.deepEqual(result, expected);
            },
        );
    });

    describe("createValuesForStatus", () => {
        test("deve alterar o status e aplicar as regras sem modificar os valores originais", () => {
            const values = {
                status: "PLAYING" as const,
                rating: "4,5",
                playtimeHours: "12",
                platforms: [1],
                startedAt: "2026-01-01",
                completedAt: "",
            };

            const originalValues = structuredClone(values);

            const result = createValuesForStatus(values, "COMPLETED", "2026-01-02");

            assert.deepEqual(result, {
                ...originalValues,
                status: "COMPLETED",
                completedAt: "2026-01-02",
            });

            assert.deepEqual(values, originalValues);
        });
    });

    describe("createUpdateCandidate", () => {
        test.each([
            {
                scenario: "um jogo marcado como quero jogar com campos vazios",
                override: {
                    status: "WANT_TO_PLAY" as const,
                    playtimeHours: "",
                    platforms: [],
                },
                expected: {
                    status: "WANT_TO_PLAY" as const,
                    rating: null,
                    playtimeMinutes: 0,
                    platforms: [],
                    startedAt: null,
                    completedAt: null,
                },
            },
            {
                scenario: "um jogo em andamento",
                override: {
                    status: "PLAYING" as const,
                },
                expected: {
                    status: "PLAYING" as const,
                    rating: 4.5,
                    playtimeMinutes: 720,
                    platforms: [1],
                    startedAt: new Date("2026-01-01T00:00:00.000Z"),
                    completedAt: null,
                },
            },
            {
                scenario: "jogo concluído com datas preenchidas",
                override: { status: "COMPLETED" as const },
                expected: {
                    status: "COMPLETED" as const,
                    rating: 4.5,
                    playtimeMinutes: 720,
                    platforms: [1],
                    startedAt: new Date("2026-01-01T00:00:00.000Z"),
                    completedAt: new Date("2026-01-02T00:00:00.000Z"),
                },
            },
        ])("deve converter $scenario", ({ override, expected }) => {
            const values = {
                ...baseFormValues,
                ...override,
            };

            const result = createUpdateCandidate(values, "2026-01-02");

            assert.deepEqual(result, expected);
        });
    });
});
