import { assert, describe, test } from "vitest";

import {
    createDefaultValues,
    createUpdateCandidate,
    getDateValidationError,
    type LibraryGameDetailsFormValues,
} from "../../../../../src/components/library/details/libraryGameDetailsForm.rules";

import { createLibraryEntryDetails } from "../../../../fixtures/library.fixture";

describe("libraryGameDetailsForm.rules.ts", () => {
    const baseFormValues: LibraryGameDetailsFormValues = {
        status: "PAUSED",
        rating: "4,5",
        playtimeHours: "12",
        platforms: [1],
        startedAt: "2026-01-01",
        completedAt: "2026-01-02",
    };

    describe("createDefaultValues", () => {
        test("deve exibir os dados salvos sem limpar campos conforme o status", () => {
            const entry = createLibraryEntryDetails({
                status: "WANT_TO_PLAY",
                rating: 4.5,
                playtimeMinutes: 720,
                platforms: [{ id: 1, name: "PC" }],
                startedAt: "2026-01-01T12:00:00.000Z",
                completedAt: "2026-01-02T18:00:00.000Z",
            });

            const originalEntry = structuredClone(entry);

            const result = createDefaultValues(entry);

            assert.deepEqual(result, { ...baseFormValues, status: "WANT_TO_PLAY" });
            assert.deepEqual(entry, originalEntry);
        });

        test("deve manter os campos opcionais vazios ao carregar um jogo em andamento", () => {
            const entry = createLibraryEntryDetails({ status: "PLAYING" });

            const result = createDefaultValues(entry);

            assert.deepEqual(result, {
                status: "PLAYING",
                rating: "",
                playtimeHours: "",
                platforms: [],
                startedAt: "",
                completedAt: "",
            });
        });
    });

    describe("createUpdateCandidate", () => {
        test("deve converter os campos alterados para o contrato da API", () => {
            const result = createUpdateCandidate(baseFormValues, [
                "status",
                "rating",
                "playtimeHours",
                "platforms",
                "startedAt",
                "completedAt",
            ]);

            assert.deepEqual(result, {
                status: "PAUSED",
                rating: 4.5,
                playtimeMinutes: 720,
                platforms: [1],
                startedAt: new Date("2026-01-01T00:00:00.000Z"),
                completedAt: new Date("2026-01-02T00:00:00.000Z"),
            });
        });

        test("deve enviar somente o status quando os demais campos não foram alterados", () => {
            const values = { ...baseFormValues, status: "WANT_TO_PLAY" as const };

            const originalValues = structuredClone(values);

            const result = createUpdateCandidate(values, ["status"]);

            assert.deepEqual(result, { status: "WANT_TO_PLAY" });
            assert.deepEqual(values, originalValues);
        });

        test("deve converter a limpeza explícita dos campos opcionais", () => {
            const values = {
                ...baseFormValues,
                rating: "",
                playtimeHours: "",
                platforms: [],
                startedAt: "",
                completedAt: "",
            };

            const result = createUpdateCandidate(values, [
                "rating",
                "playtimeHours",
                "platforms",
                "startedAt",
                "completedAt",
            ]);

            assert.deepEqual(result, {
                rating: null,
                playtimeMinutes: 0,
                platforms: [],
                startedAt: null,
                completedAt: null,
            });
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
            {
                scenario: "ambas as datas vazias",
                override: { startedAt: "", completedAt: "" },
                today: "2026-01-03",
            },
            {
                scenario: "conclusão sem início informado",
                override: { startedAt: "" },
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
});
