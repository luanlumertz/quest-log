import { assert, describe, test } from "vitest";

import { formatRating } from "../../../src/utils/formatRating";

describe("formatRating", () => {
    test.each([
        {
            scenario: "nota inteira",
            entry: 4,
            expected: "4",
        },
        {
            scenario: "nota decimal",
            entry: 3.9,
            expected: "3.9",
        },
    ])("deve formatar corretamente $scenario", ({ entry, expected }) => {
        const result = formatRating(entry);

        assert.equal(result, expected);
    });
});
