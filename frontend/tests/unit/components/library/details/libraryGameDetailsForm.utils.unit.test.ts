import { afterEach, assert, describe, test, vi } from "vitest";

import {
    dateInputToDate,
    dateToInputValue,
    getTodayInputValue,
    hoursInputToMinutes,
    minutesToHoursInput,
    normalizeHoursInput,
    ratingInputToNumber,
} from "../../../../../src/components/library/details/libraryGameDetailsForm.utils";

describe("libraryGameDetailsForm.utils.ts", () => {
    describe("hoursInputToMinutes", () => {
        test.each([
            {
                scenario: "horas decimais com vírgula para minutos",
                input: "1,5",
                expected: 90,
            },
            {
                scenario: "horas inteiras",
                input: "2",
                expected: 120,
            },
            {
                scenario: "horas decimais com ponto",
                input: "1.5",
                expected: 90,
            },
            {
                scenario: "duas casas decimais",
                input: "2,25",
                expected: 135,
            },
            {
                scenario: "arredondamento dos minutos",
                input: "1,33",
                expected: 80,
            },
            {
                scenario: "campo vazio",
                input: "",
                expected: 0,
            },
            {
                scenario: "campo com espaços",
                input: " 1,5 ",
                expected: 90,
            },
        ])("deve converter $scenario", ({ input, expected }) => {
            const result = hoursInputToMinutes(input);

            assert.equal(result, expected);
        });

        test("deve retornar NaN para uma entrada não numérica", () => {
            const result = hoursInputToMinutes("abc");

            assert.isNaN(result);
        });
    });

    describe("minutesToHoursInput", () => {
        test.each([
            {
                scenario: "tempo zerado",
                input: 0,
                expected: "",
            },
            {
                scenario: "horas inteiras",
                input: 120,
                expected: "2",
            },
            {
                scenario: "horas com meia hora",
                input: 90,
                expected: "1,5",
            },
            {
                scenario: "horas com duas casas decimais",
                input: 135,
                expected: "2,25",
            },
            {
                scenario: "arredondamento decimal",
                input: 125,
                expected: "2,08",
            },
        ])("deve converter $scenario", ({ input, expected }) => {
            const result = minutesToHoursInput(input);

            assert.equal(result, expected);
        });
    });

    describe("normalizeHoursInput", () => {
        test.each([
            {
                scenario: "horas inteiras",
                input: "12",
                expected: "12",
            },
            {
                scenario: "ponto convertido em vírgula",
                input: "1.5",
                expected: "1,5",
            },
            {
                scenario: "duas casas decimais",
                input: "2,25",
                expected: "2,25",
            },
            {
                scenario: "excesso de casas decimais",
                input: "1,2345",
                expected: "1,23",
            },
            {
                scenario: "caracteres inválidos",
                input: "abc12,5xyz",
                expected: "12,5",
            },
            {
                scenario: "espaços extras",
                input: " 1,5 ",
                expected: "1,5",
            },
            {
                scenario: "campo vazio",
                input: "",
                expected: "",
            },
            {
                scenario: "separador decimal sem dígitos após a vírgula",
                input: "12,",
                expected: "12,",
            },
        ])("deve normalizar $scenario", ({ input, expected }) => {
            const result = normalizeHoursInput(input);

            assert.equal(result, expected);
        });
    });

    describe("ratingInputToNumber", () => {
        test.each([
            {
                scenario: "nota decimal com vírgula",
                input: "4,5",
                expected: 4.5,
            },
            {
                scenario: "nota decimal com ponto",
                input: "3.9",
                expected: 3.9,
            },
            {
                scenario: "nota inteira",
                input: "4",
                expected: 4,
            },
            {
                scenario: "nota zerada",
                input: "0",
                expected: 0,
            },
            {
                scenario: "campo vazio",
                input: "",
                expected: null,
            },
            {
                scenario: "apenas espaços",
                input: "   ",
                expected: null,
            },
            {
                scenario: "espaços externos",
                input: " 4,5 ",
                expected: 4.5,
            },
        ])("deve converter $scenario", ({ input, expected }) => {
            const result = ratingInputToNumber(input);

            assert.equal(result, expected);
        });

        test("deve retornar NaN para uma nota não numérica", () => {
            const result = ratingInputToNumber("abc");

            assert.isNaN(result);
        });
    });

    describe("dateToInputValue", () => {
        test.each([
            {
                scenario: "data ISO completa",
                input: "2026-01-02T15:30:00.000Z",
                expected: "2026-01-02",
            },
            {
                scenario: "data sem horário",
                input: "2026-01-02",
                expected: "2026-01-02",
            },
            {
                scenario: "data nula",
                input: null,
                expected: "",
            },
            {
                scenario: "string vazia",
                input: "",
                expected: "",
            },
        ])("deve converter $scenario", ({ input, expected }) => {
            const result = dateToInputValue(input);

            assert.equal(result, expected);
        });
    });

    describe("dateInputToDate", () => {
        test.each([
            {
                scenario: "data válida",
                input: "2026-01-02",
                expected: new Date("2026-01-02T00:00:00.000Z"),
            },
            {
                scenario: "campo vazio",
                input: "",
                expected: null,
            },
        ])("deve converter $scenario", ({ input, expected }) => {
            const result = dateInputToDate(input);

            assert.deepEqual(result, expected);
        });
    });

    describe("getTodayInputValue", () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        test("deve retornar a data atual no formato YYYY-MM-DD", () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));

            const result = getTodayInputValue();

            assert.equal(result, "2026-01-01");
        });
    });
});
