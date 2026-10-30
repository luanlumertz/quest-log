import { afterEach, describe, expect, test, vi } from "vitest";
import { getAppEnvironment } from "../../../src/lib/appEnvironment.js";

describe("ambiente da aplicação", () => {
    afterEach(() => vi.unstubAllEnvs());

    test.each([
        [undefined, "development"],
        ["development", "development"],
        ["test", "test"],
        ["production", "production"],
    ])("deve preservar o ambiente sem APP_ENV com NODE_ENV=%s", (nodeEnvironment, expected) => {
        vi.stubEnv("NODE_ENV", nodeEnvironment);
        vi.stubEnv("APP_ENV", undefined);

        const environment = getAppEnvironment();

        expect(environment).toBe(expected);
    });

    test.each([
        ["development", "development"],
        ["test", "test"],
        ["production", "production"],
        ["production", "sandbox"],
    ])("deve aceitar NODE_ENV=%s com APP_ENV=%s", (nodeEnvironment, appEnvironment) => {
        vi.stubEnv("NODE_ENV", nodeEnvironment);
        vi.stubEnv("APP_ENV", appEnvironment);

        const environment = getAppEnvironment();

        expect(environment).toBe(appEnvironment);
    });

    test.each(["sandbox", "staging", "", "Production"])(
        "deve rejeitar NODE_ENV inválido: %s",
        (nodeEnvironment) => {
            vi.stubEnv("NODE_ENV", nodeEnvironment);
            vi.stubEnv("APP_ENV", undefined);

            expect(() => getAppEnvironment()).toThrow(
                "NODE_ENV deve ser development, test ou production.",
            );
        },
    );

    test.each(["staging", "", "Sandbox"])(
        "deve rejeitar APP_ENV inválido: %s",
        (appEnvironment) => {
            vi.stubEnv("NODE_ENV", "production");
            vi.stubEnv("APP_ENV", appEnvironment);

            expect(() => getAppEnvironment()).toThrow(
                "APP_ENV deve ser development, test, production ou sandbox.",
            );
        },
    );

    test.each([
        ["development", "sandbox", "production"],
        ["test", "sandbox", "production"],
        [undefined, "sandbox", "production"],
        ["production", "development", "development"],
        ["production", "test", "test"],
        ["development", "production", "production"],
    ])(
        "deve impedir combinação incompatível NODE_ENV=%s e APP_ENV=%s",
        (nodeEnvironment, appEnvironment, expectedNodeEnvironment) => {
            vi.stubEnv("NODE_ENV", nodeEnvironment);
            vi.stubEnv("APP_ENV", appEnvironment);

            expect(() => getAppEnvironment()).toThrow(
                `APP_ENV=${appEnvironment} exige NODE_ENV=${expectedNodeEnvironment}.`,
            );
        },
    );
});
