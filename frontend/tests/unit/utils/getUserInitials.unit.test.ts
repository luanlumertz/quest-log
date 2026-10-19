import { assert, describe, test } from "vitest";

import { getUserInitials } from "../../../src/utils/getUserInitials";

describe("getUserInitials", () => {
    test.each([
        {
            scenario: "nome único em letras minúsculas",
            entry: "flávio",
            expected: "F",
        },
        {
            scenario: "nome completo",
            entry: "Flávio Silva",
            expected: "FS",
        },
        {
            scenario: "nome com vários sobrenomes",
            entry: "Flávio de Oliveria Silva",
            expected: "FS",
        },
        {
            scenario: "espaços extras",
            entry: "  Flávio   Silva  ",
            expected: "FS",
        },
    ])("deve gerar as iniciais corretamente para $scenario", ({ entry, expected }) => {
        const result = getUserInitials(entry);

        assert.equal(result, expected);
    });
});
