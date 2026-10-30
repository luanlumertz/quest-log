export type AppEnvironment = "development" | "test" | "production" | "sandbox";

export function getAppEnvironment(): AppEnvironment {
    const nodeEnvironment = process.env.NODE_ENV ?? "development";

    if (!["development", "test", "production"].includes(nodeEnvironment)) {
        throw new Error("NODE_ENV deve ser development, test ou production.");
    }

    const appEnvironment = process.env.APP_ENV ?? nodeEnvironment;

    if (
        appEnvironment !== "development" &&
        appEnvironment !== "test" &&
        appEnvironment !== "production" &&
        appEnvironment !== "sandbox"
    ) {
        throw new Error("APP_ENV deve ser development, test, production ou sandbox.");
    }

    const expectedNodeEnvironment = appEnvironment === "sandbox" ? "production" : appEnvironment;

    if (nodeEnvironment !== expectedNodeEnvironment) {
        throw new Error(`APP_ENV=${appEnvironment} exige NODE_ENV=${expectedNodeEnvironment}.`);
    }

    return appEnvironment;
}
