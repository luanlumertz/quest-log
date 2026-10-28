import { defineConfig } from "@playwright/test";

const e2eOriginSecret = "chave_ficticia_exclusiva_para_proxy_e2e";

export default defineConfig({
    testDir: "./e2e/tests",
    globalSetup: "./e2e/global-setup.ts",

    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    workers: 1,
    retries: 0,
    globalTimeout: process.env.CI ? 10 * 60 * 1000 : undefined,

    reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",

    use: {
        baseURL: "http://localhost:5173",
        browserName: "chromium",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },

    webServer: [
        {
            name: "Backend E2E",
            command: "npm --prefix backend run dev:e2e",
            env: { ORIGIN_SECRET: e2eOriginSecret },
            url: "http://localhost:3000/healthz",
            reuseExistingServer: false,
            timeout: 60_000,
        },
        {
            name: "Frontend E2E",
            command: "npm --prefix frontend run dev:e2e",
            env: { VITE_API_URL: "/api", ORIGIN_SECRET: e2eOriginSecret },
            url: "http://localhost:5173",
            reuseExistingServer: false,
            timeout: 60_000,
        },
    ],
});
