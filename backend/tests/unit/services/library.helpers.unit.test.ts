import { assert, describe, test } from "vitest";
import { Prisma } from "@prisma/client";

import {
    formatLibraryEntry,
    normalizeLibraryEntryDates,
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
    describe("normalizeLibraryEntryDates", () => {
        test("deve normalizar as datas sem modificar os dados originais", () => {
            const data = {
                startedAt: new Date("2026-01-10T12:00:00.000Z"),
                completedAt: new Date("2026-02-10T18:30:00.000Z"),
            };

            const result = normalizeLibraryEntryDates(data);

            assert.equal(result.startedAt?.toISOString(), "2026-01-10T00:00:00.000Z");
            assert.equal(result.completedAt?.toISOString(), "2026-02-10T00:00:00.000Z");

            assert.equal(data.startedAt.toISOString(), "2026-01-10T12:00:00.000Z");
            assert.equal(data.completedAt.toISOString(), "2026-02-10T18:30:00.000Z");
            assert.notStrictEqual(result, data);
        });

        test("deve preservar datas nulas e não preencher campos omitidos", () => {
            const data = {
                status: "COMPLETED" as const,
                startedAt: null,
            };

            const result = normalizeLibraryEntryDates(data);

            assert.deepEqual(result, data);
            assert.notProperty(result, "completedAt");
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
