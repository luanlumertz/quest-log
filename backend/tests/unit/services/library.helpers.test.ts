import { afterEach, assert, describe, test, vi } from "vitest";
import { Prisma } from "@prisma/client";

import {
    applyLibraryEntryStatusRules,
    formatLibraryEntry,
    getInitialDates,
    normalizeDate,
    validateLibraryEntryDates,
} from "../../../src/services/library.helpers.js";
import { AppError } from "../../../src/errors/AppError.js";

import { captureError } from "../../helpers/errors/captureError.helper.js";
import {
    createCurrentLibraryEntry,
    createLibraryEntry,
} from "../../factories/libraryEntry.factory.js";

describe("library.helpers.ts", () => {
    describe("applyLibraryEntryStatusRules", () => {
        test("não deve permitir status PLAYING com startedAt explicitamente null", () => {
            const currentEntry = createCurrentLibraryEntry();

            const data = {
                status: "PLAYING" as const,
                startedAt: null,
            };

            const error = captureError(
                () => applyLibraryEntryStatusRules(currentEntry, data),
                AppError,
            );

            assert.equal(error.statusCode, 400);
            assert.equal(
                error.message,
                "Um jogo com status PLAYING deve possuir uma data de início",
            );
        });

        test("não deve permitir status PLAYING com completedAt informado", () => {
            const currentEntry = createCurrentLibraryEntry();

            const data = {
                status: "PLAYING" as const,
                completedAt: new Date("2026-01-10T12:00:00.000Z"),
            };

            const error = captureError(
                () => applyLibraryEntryStatusRules(currentEntry, data),
                AppError,
            );

            assert.equal(error.statusCode, 400);
            assert.equal(
                error.message,
                "Um jogo com status PLAYING não pode possuir data de conclusão",
            );
        });

        test("não deve permitir status COMPLETED com completedAt explicitamente null", () => {
            const currentEntry = createCurrentLibraryEntry();

            const data = {
                status: "COMPLETED" as const,
                completedAt: null,
            };

            const error = captureError(
                () => applyLibraryEntryStatusRules(currentEntry, data),
                AppError,
            );

            assert.equal(error.statusCode, 400);
            assert.equal(
                error.message,
                "Um jogo com status COMPLETED deve possuir uma data de conclusão",
            );
        });

        test("não deve permitir status WANT_TO_PLAY com startedAt informado", () => {
            const currentEntry = createCurrentLibraryEntry();

            const data = {
                status: "WANT_TO_PLAY" as const,
                startedAt: new Date("2026-01-10T12:00:00.000Z"),
            };

            const error = captureError(
                () => applyLibraryEntryStatusRules(currentEntry, data),
                AppError,
            );

            assert.equal(error.statusCode, 400);
            assert.equal(
                error.message,
                "Um jogo com status WANT_TO_PLAY não pode possuir data de início",
            );
        });

        test("não deve permitir status WANT_TO_PLAY com completedAt informado", () => {
            const currentEntry = createCurrentLibraryEntry();

            const data = {
                status: "WANT_TO_PLAY" as const,
                completedAt: new Date("2026-02-10T12:00:00.000Z"),
            };

            const error = captureError(
                () => applyLibraryEntryStatusRules(currentEntry, data),
                AppError,
            );

            assert.equal(error.statusCode, 400);
            assert.equal(
                error.message,
                "Um jogo com status WANT_TO_PLAY não pode possuir data de conclusão",
            );
        });

        test("não deve permitir status ABANDONED com completedAt informado", () => {
            const currentEntry = createCurrentLibraryEntry();

            const data = {
                status: "ABANDONED" as const,
                completedAt: new Date("2026-02-10T12:00:00.000Z"),
            };

            const error = captureError(
                () => applyLibraryEntryStatusRules(currentEntry, data),
                AppError,
            );

            assert.equal(error.statusCode, 400);
            assert.equal(
                error.message,
                "Um jogo com status ABANDONED não pode possuir data de conclusão",
            );
        });

        test("deve normalizar startedAt sem modificar os dados originais", () => {
            const currentEntry = createCurrentLibraryEntry({
                status: "PLAYING",
                startedAt: new Date("2026-01-01T12:00:00.000Z"),
            });

            const data = {
                startedAt: new Date("2026-01-10T12:00:00.000Z"),
            };

            const result = applyLibraryEntryStatusRules(currentEntry, data);

            assert.equal(result.startedAt?.toISOString(), "2026-01-10T00:00:00.000Z");
            assert.equal(data.startedAt.toISOString(), "2026-01-10T12:00:00.000Z");
            assert.notStrictEqual(result, data);
        });

        test("deve normalizar completedAt sem modificar os dados originais", () => {
            const currentEntry = createCurrentLibraryEntry({
                status: "COMPLETED",
                startedAt: new Date("2026-01-01T12:00:00.000Z"),
                completedAt: new Date("2026-01-10T12:00:00.000Z"),
            });

            const data = {
                completedAt: new Date("2026-02-10T18:30:00.000Z"),
            };

            const result = applyLibraryEntryStatusRules(currentEntry, data);

            assert.equal(result.completedAt?.toISOString(), "2026-02-10T00:00:00.000Z");
            assert.equal(data.completedAt.toISOString(), "2026-02-10T18:30:00.000Z");
            assert.notStrictEqual(result, data);
        });
    });

    describe("getInitialDates", () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        test("deve retornar datas nulas para status WANT_TO_PLAY", () => {
            const result = getInitialDates("WANT_TO_PLAY");

            assert.isNull(result.startedAt);
            assert.isNull(result.completedAt);
        });

        test("deve definir startedAt para a data atual ao iniciar um jogo como PLAYING", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2026-01-10T15:30:00.000Z"));

            const result = getInitialDates("PLAYING");

            assert.equal(result.startedAt?.toISOString(), "2026-01-10T00:00:00.000Z");
            assert.isNull(result.completedAt);
        });

        test("deve definir completedAt para a data atual ao adicionar um jogo como COMPLETED", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2026-01-10T15:30:00.000Z"));

            const result = getInitialDates("COMPLETED");

            assert.equal(result.completedAt?.toISOString(), "2026-01-10T00:00:00.000Z");
            assert.isNull(result.startedAt);
        });

        test("deve retornar datas nulas para status ABANDONED", () => {
            const result = getInitialDates("ABANDONED");

            assert.isNull(result.startedAt);
            assert.isNull(result.completedAt);
        });
    });

    describe("validateLibraryEntryDates", () => {
        test("não deve permitir alterar startedAt para uma data posterior à conclusão existente", () => {
            const currentEntry = createCurrentLibraryEntry({
                status: "COMPLETED",
                startedAt: new Date("2026-01-10T12:00:00.000Z"),
                completedAt: new Date("2026-02-10T12:00:00.000Z"),
            });

            const data = {
                startedAt: new Date("2026-02-15T12:00:00.000Z"),
            };

            const error = captureError(
                () => validateLibraryEntryDates(currentEntry, data),
                AppError,
            );

            assert.equal(error.statusCode, 400);
            assert.equal(
                error.message,
                "A data de conclusão não pode ser anterior à data de início",
            );
        });

        test("deve permitir data de início e conclusão no mesmo dia, independentemente do horário", () => {
            const currentEntry = createCurrentLibraryEntry();

            const data = {
                status: "COMPLETED" as const,
                startedAt: new Date("2026-01-10T20:00:00.000Z"),
                completedAt: new Date("2026-01-10T08:00:00.000Z"),
            };

            assert.doesNotThrow(() => validateLibraryEntryDates(currentEntry, data));
        });
    });

    describe("formatLibraryEntry", () => {
        test("deve converter rating de Decimal para number e formatar as plataformas", () => {
            const entry = createLibraryEntry({
                rating: new Prisma.Decimal(4.5),
                libraryEntryPlatforms: [
                    { platform: { id: 1, name: "PC" } },
                    { platform: { id: 2, name: "PlayStation 5" } },
                ],
            });

            const result = formatLibraryEntry(entry);

            assert.typeOf(result.rating, "number");
            assert.equal(result.rating, 4.5);
            assert.deepEqual(result.platforms, [
                { id: 1, name: "PC" },
                { id: 2, name: "PlayStation 5" },
            ]);
            assert.notProperty(result, "libraryEntryPlatforms");
        });

        test("deve preservar rating null ao formatar uma entrada sem avaliação", () => {
            const entry = createLibraryEntry({
                rating: null,
            });

            const result = formatLibraryEntry(entry);

            assert.isNull(result.rating);
        });
    });

    describe("normalizeDate", () => {
        test("deve normalizar uma data para meia-noite UTC sem modificar a original", () => {
            const originalDate = new Date("2026-01-10T23:30:00-03:00");

            const result = normalizeDate(originalDate);

            assert.equal(result.toISOString(), "2026-01-11T00:00:00.000Z");
            assert.equal(originalDate.toISOString(), "2026-01-11T02:30:00.000Z");
            assert.notStrictEqual(result, originalDate);
        });
    });
});
