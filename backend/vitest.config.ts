import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts"],
            exclude: ["src/server.ts"],

            thresholds: {
                statements: 90,
                branches: 90,
                functions: 90,
                lines: 90,
            },
        },

        projects: [
            {
                test: {
                    name: "integration",
                    include: ["tests/integration/**/*.test.ts"],
                    setupFiles: [
                        "./tests/integration/setup.ts",
                        "./tests/mocks/rawg.mock.ts",
                        "./tests/mocks/mail.mock.ts",
                    ],
                    fileParallelism: false,
                    mockReset: true,
                },
            },
            {
                test: {
                    name: "unit",
                    include: ["tests/unit/**/*.test.ts"],
                },
            },
        ],
    },
});
