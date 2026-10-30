import {
    assertSandboxCleanupEnvironment,
    SANDBOX_DATABASE_NAME,
    SANDBOX_INACTIVITY_DAYS,
} from "../lib/sandboxCleanup.js";
import {
    countInactiveSandboxUsers,
    deleteInactiveSandboxUsers,
    getConnectedDatabaseName,
} from "../repositories/sandboxCleanup.repository.js";
import { runInTransaction } from "../repositories/transaction.repository.js";

export async function cleanupInactiveSandboxUsers({ execute = false }: { execute?: boolean } = {}) {
    assertSandboxCleanupEnvironment();

    const cutoff = new Date(Date.now() - SANDBOX_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);

    return runInTransaction(async (tx) => {
        if ((await getConnectedDatabaseName(tx)) !== SANDBOX_DATABASE_NAME) {
            throw new Error(
                "Limpeza interrompida: a conexão real não está no banco quest_log_sandbox.",
            );
        }

        const candidates = await countInactiveSandboxUsers(cutoff, tx);
        const deleted = execute ? (await deleteInactiveSandboxUsers(cutoff, tx)).count : 0;

        return {
            mode: execute ? "execute" : "dry-run",
            database: SANDBOX_DATABASE_NAME,
            inactivityDays: SANDBOX_INACTIVITY_DAYS,
            cutoff: cutoff.toISOString(),
            candidates,
            deleted,
        };
    });
}
