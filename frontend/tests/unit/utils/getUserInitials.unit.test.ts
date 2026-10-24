import { assert, describe, test } from "vitest";

import { getUserInitials } from "../../../src/utils/getUserInitials";

describe("getUserInitials", () => {
    test.each([
        { scenario: "apelido cercado de símbolos", entry: "_a_", expected: "A" },
        { scenario: "trecho composto só de símbolos", entry: "Pedro _ Silva", expected: "PS" },
        { scenario: "apelido com números", entry: "_99_", expected: "9" },
        { scenario: "nenhuma inicial disponível", entry: "___", expected: "?" },
        { scenario: "nome vazio", entry: "", expected: "?" },
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
