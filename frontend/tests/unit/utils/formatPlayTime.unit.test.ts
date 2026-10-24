import { assert, describe, test } from "vitest";

import { formatPlayTime } from "../../../src/utils/formatPlayTime";

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
            scenario: "milhares de horas sem separador de agrupamento",
            entry: 138300,
            expected: "2305 h",
        },
    ])("deve formatar corretamente $scenario", ({ entry, expected }) => {
        const result = formatPlayTime(entry);

        assert.equal(result, expected);
    });
});
