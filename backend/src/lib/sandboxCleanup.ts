import { getAppEnvironment } from "./appEnvironment.js";

export const SANDBOX_DATABASE_NAME = "quest_log_sandbox";
export const SANDBOX_INACTIVITY_DAYS = 30;

export function assertSandboxCleanupEnvironment() {
    if (getAppEnvironment() !== "sandbox") {
        throw new Error(
            "A limpeza de contas só pode executar com APP_ENV=sandbox e NODE_ENV=production.",
        );
    }

    let databaseUrl: URL;

    try {
        databaseUrl = new URL(process.env.DATABASE_URL ?? "");
    } catch {
        throw new Error("DATABASE_URL inválida para a limpeza do sandbox.");
    }

    if (
        !["postgres:", "postgresql:"].includes(databaseUrl.protocol) ||
        databaseUrl.pathname !== `/${SANDBOX_DATABASE_NAME}`
    ) {
        throw new Error("A limpeza exige DATABASE_URL apontando para quest_log_sandbox.");
    }
}

export function parseSandboxCleanupArguments(args: string[]): boolean {
    if (args.length === 0 || (args.length === 1 && args[0] === "--dry-run")) return false;
    if (args.length === 1 && args[0] === "--execute") return true;

    throw new Error("Use nenhum argumento, --dry-run ou --execute. A exclusão exige --execute.");
}
