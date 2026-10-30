import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts"],
            exclude: [
                "src/server.ts",
                "src/generated/prisma/**",
                "src/openapi.ts",
                "src/openapi/**",
            ],

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
                    env: { FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173" },
                    include: ["tests/integration/**/*.test.ts"],
                    setupFiles: [
                        "./tests/mocks/rawg.mock.ts",
                        "./tests/mocks/mail.mock.ts",
                        "./tests/integration/setup.ts",
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
