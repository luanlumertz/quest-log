import { assert, describe, test } from "vitest";

import { formatPlayTime, formatPlayTimeHours } from "../../../src/utils/formatPlayTime";

describe("formatPlayTime", () => {
    test.each([
        {
            scenario: "um tempo zerado",
            entry: 0,
            expected: "0 h",
        },
        {
            scenario: "um registro antigo com poucos minutos",
            entry: 1,
            expected: "0 h",
        },
        {
            scenario: "um tempo inferior a uma hora",
            entry: 45,
            expected: "0,8 h",
        },
        {
            scenario: "exatamente uma hora",
            entry: 60,
            expected: "1 h",
        },
        {
            scenario: "horas arredondadas para uma casa decimal",
            entry: 125,
            expected: "2,1 h",
        },
        {
            scenario: "um valor no meio do arredondamento decimal",
            entry: 69,
            expected: "1,2 h",
        },
        {
            scenario: "centenas de horas com vírgula decimal",
            entry: 13830,
            expected: "230,5 h",
        },
        {
            scenario: "milhares de horas com separador de agrupamento",
            entry: 138300,
            expected: "2.305 h",
        },
        {
            scenario: "milhares de horas com uma casa decimal",
            entry: 74070,
            expected: "1.234,5 h",
        },
        {
            scenario: "milhões de horas",
            entry: 60000000,
            expected: "1.000.000 h",
        },
    ])("deve formatar corretamente $scenario", ({ entry, expected }) => {
        const result = formatPlayTime(entry);

        assert.equal(result, expected);
    });

    test("deve manter as horas sem agrupamento para o campo de edição", () => {
        const result = formatPlayTimeHours(74070);

        assert.equal(result, "1234,5");
    });
});
