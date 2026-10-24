import { afterEach, describe, expect, test, vi } from "vitest";

describe("prisma.ts", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    test("deve impedir a conexão quando DATABASE_URL não estiver definida", async () => {
        vi.stubEnv("DATABASE_URL", undefined);
        vi.resetModules();

        await expect(import("../../../src/lib/prisma.js")).rejects.toThrow(
            "DATABASE_URL não definida.",
        );
    });
});
