import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.js";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            mockReset: true,

            projects: [
                {
                    extends: true,
                    test: {
                        name: "unit",
                        include: ["tests/unit/**/*.test.ts"],
                        environment: "node",
                    },
                },
                {
                    extends: true,
                    test: {
                        name: "integration",
                        include: ["tests/integration/**/*.{test,spec}.{ts,tsx}"],
                        environment: "jsdom",
                        setupFiles: ["./tests/integration/setup.ts"],
                    },
                },
            ],

            coverage: {
                provider: "v8",
                reporter: ["text", "html", "lcov"],
                reportsDirectory: "./coverage",
                include: ["src/**/*.{ts,tsx}"],
                exclude: ["src/main.tsx", "src/App.tsx"],
                thresholds: {
                    statements: 90,
                    branches: 90,
                    functions: 90,
                    lines: 90,
                },
            },
        },
    }),
);
