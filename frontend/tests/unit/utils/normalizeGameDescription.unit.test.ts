import { assert, describe, test } from "vitest";

import { normalizeGameDescription } from "../../../src/utils/normalizeGameDescription";

describe("normalizeGameDescription", () => {
    test("deve normalizar múltiplos títulos na mesma descrição", () => {
        const result = normalizeGameDescription("# História\n## Mecânicas");

        assert.equal(result, "\n\n### História\n\n\n### Mecânicas");
    });

    test.each([
        {
            scenario: "título com seis #",
            entry: "###### Conclusão",
            expected: "\n\n### Conclusão",
        },
        {
            scenario: "título com acento",
            entry: "## Época",
            expected: "\n\n### Época",
        },
        {
            scenario: "texto sem formatação especial",
            entry: "Um jogo de aventura.",
            expected: "Um jogo de aventura.",
        },
    ])("deve normalizar corretamente $scenario", ({ entry, expected }) => {
        const result = normalizeGameDescription(entry);

        assert.equal(result, expected);
    });
});
