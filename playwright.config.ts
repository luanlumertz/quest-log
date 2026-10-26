import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e/tests",
    globalSetup: "./e2e/global-setup.ts",

    fullyParallel: false,
    workers: 1,
    retries: 0,

    reporter: "list",

    use: {
        baseURL: "http://localhost:5173",
        browserName: "chromium",
        trace: "retain-on-failure",
    },

    webServer: [
        {
            name: "Backend E2E",
            command: "npm --prefix backend run dev:e2e",
            url: "http://localhost:3000/healthz",
            reuseExistingServer: false,
            timeout: 60_000,
        },
        {
            name: "Frontend E2E",
            command: "npm --prefix frontend run dev:e2e",
            url: "http://localhost:5173",
            reuseExistingServer: false,
            timeout: 60_000,
        },
    ],
});
