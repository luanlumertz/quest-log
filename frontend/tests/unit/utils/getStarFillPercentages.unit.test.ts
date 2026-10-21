import { assert, describe, test } from "vitest";

import { getStarFillPercentages } from "../../../src/utils/getStarFillPercentages";

describe("getStarFillPercentages", () => {
    test.each([
        {
            scenario: "nota zerada",
            entry: 0,
            expected: [0, 0, 0, 0, 0],
        },
        {
            scenario: "nota decimal",
            entry: 3.5,
            expected: [100, 100, 100, 50, 0],
        },
        {
            scenario: "nota abaixo de zero",
            entry: -1,
            expected: [0, 0, 0, 0, 0],
        },
        {
            scenario: "nota acima de cinco",
            entry: 6,
            expected: [100, 100, 100, 100, 100],
        },
    ])("deve calcular corretamente os percentuais para $scenario", ({ entry, expected }) => {
        const result = getStarFillPercentages(entry);

        assert.deepEqual(result, expected);
    });
});
