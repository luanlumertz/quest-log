import { assert, describe, test } from "vitest";

import { formatDate } from "../../../src/utils/formatDate";

describe("formatDate", () => {
    test.each([
        {
            scenario: "data da RAWG",
            entry: "2024-03-15",
            expected: "Mar 15, 2024",
        },
        {
            scenario: "data ISO do backend",
            entry: "2024-03-15T00:00:00.000Z",
            expected: "Mar 15, 2024",
        },
    ])("deve formatar corretamente $scenario", ({ entry, expected }) => {
        const result = formatDate(entry);

        assert.equal(result, expected);
    });

    test("deve lançar erro para uma data inválida", () => {
        assert.throws(() => formatDate("data-invalida"), RangeError);
    });
});
