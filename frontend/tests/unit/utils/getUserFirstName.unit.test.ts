import { assert, describe, test } from "vitest";

import { getUserFirstName } from "../../../src/utils/getUserFirstName";

describe("getUserFirstName", () => {
    test.each([
        {
            scenario: "nome único",
            entry: "Flávio",
            expected: "Flávio",
        },
        {
            scenario: "nome completo",
            entry: "Flávio Silva",
            expected: "Flávio",
        },
        {
            scenario: "espaços extras",
            entry: "  Flávio   Silva  ",
            expected: "Flávio",
        },
    ])("deve extrair o primeiro nome corretamente para $scenario", ({ entry, expected }) => {
        const result = getUserFirstName(entry);

        assert.equal(result, expected);
    });
});
