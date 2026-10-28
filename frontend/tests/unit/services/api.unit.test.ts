import { afterEach, assert, describe, test, vi } from "vitest";

describe("endereço da API", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    test.each([
        { production: true, configured: "https://api-antiga.example", expected: "/api" },
        {
            production: false,
            configured: "http://localhost:3999",
            expected: "http://localhost:3999",
        },
        { production: false, configured: undefined, expected: "http://localhost:3000" },
    ])(
        "deve usar $expected em produção=$production",
        async ({ production, configured, expected }) => {
            vi.stubEnv("PROD", production);
            vi.stubEnv("VITE_API_URL", configured);
            vi.resetModules();

            const { API_URL } = await import("../../../src/services/api");

            assert.equal(API_URL, expected);
        },
    );
});
