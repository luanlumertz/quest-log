import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

export const API_URL = process.env.E2E_API_URL ?? "http://localhost:3000";
export const MAILPIT_URL = process.env.E2E_MAILPIT_URL ?? "http://localhost:8025";

export function readE2EEnvironment() {
    const envPath = resolve(__dirname, "../../backend/.env.e2e");
    const environment = parseEnv(readFileSync(envPath, "utf8"));
    const databaseUrl = environment.DATABASE_URL;

    if (!databaseUrl || new URL(databaseUrl).pathname !== "/quest_log_e2e") {
        throw new Error("O ambiente E2E só pode usar o banco quest_log_e2e.");
    }

    return environment;
}
