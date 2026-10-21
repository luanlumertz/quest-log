import { assert, describe, test } from "vitest";

import { formatPlayTime } from "../../../src/utils/formatPlayTime";

describe("formatPlayTime", () => {
    test.each([
        {
            scenario: "um tempo inferior a uma hora",
            entry: 45,
            expected: "45min",
        },
        {
            scenario: "exatamente uma hora",
            entry: 60,
            expected: "1h",
        },
        {
            scenario: "horas e minutos",
            entry: 125,
            expected: "2h 5min",
        },
    ])("deve formatar corretamente $scenario", ({ entry, expected }) => {
        const result = formatPlayTime(entry);

        assert.equal(result, expected);
    });
});
