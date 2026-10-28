import { readE2EEnvironment } from "../helpers/env.helper.js";
import { withE2EDatabase } from "../helpers/db.helper.js";

const environment = readE2EEnvironment();

// O arquivo E2E prevalece sobre variáveis herdadas do terminal.
Object.assign(process.env, environment);
process.env.PORT = process.env.E2E_BACKEND_URL
    ? new URL(process.env.E2E_BACKEND_URL).port || "80"
    : environment.PORT || environment.PORT_LOCAL || "3000";
process.env.AUTH_COOKIE_PATH_PREFIX = "/api";

if (process.env.E2E_FRONTEND_URL) {
    process.env.FRONTEND_URL = process.env.E2E_FRONTEND_URL;
}

// Só importa a aplicação após conferir também o banco da conexão real.
await withE2EDatabase(async () => undefined);
process.env.E2E_MODE = "true";
await import("../../backend/src/server.js");
