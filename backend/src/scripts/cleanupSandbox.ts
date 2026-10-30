import {
    assertSandboxCleanupEnvironment,
    parseSandboxCleanupArguments,
} from "../lib/sandboxCleanup.js";
import { logger } from "../lib/logger.js";
import { appendFileSync } from "node:fs";

let stage = "arguments";

async function main() {
    const execute = parseSandboxCleanupArguments(process.argv.slice(2));
    stage = "environment";
    assertSandboxCleanupEnvironment();

    stage = "load-client";
    const { prisma } = await import("../lib/prisma.js");

    try {
        stage = "load-cleanup";
        const { cleanupInactiveSandboxUsers } =
            await import("../services/sandboxCleanup.service.js");
        stage = "cleanup";
        const result = await cleanupInactiveSandboxUsers({ execute });

        console.log(JSON.stringify(result));

        if (process.env.GITHUB_STEP_SUMMARY) {
            appendFileSync(
                process.env.GITHUB_STEP_SUMMARY,
                [
                    "## Limpeza de contas do sandbox",
                    "",
                    result.mode === "execute"
                        ? "Execução concluída. As contas elegíveis foram excluídas."
                        : "Conferência concluída. Nenhuma conta foi excluída.",
                    "",
                    "| Informação | Resultado |",
                    "| --- | --- |",
                    `| Banco | ${result.database} |`,
                    `| Modo | ${result.mode === "execute" ? "Exclusão" : "Somente conferência"} |`,
                    `| Prazo de inatividade | Mais de ${result.inactivityDays} dias |`,
                    `| Data de corte (UTC) | ${result.cutoff} |`,
                    `| Contas elegíveis na conferência | ${result.candidates} |`,
                    `| Contas excluídas | ${result.deleted} |`,
                    "",
                ].join("\n"),
                "utf8",
            );
        }
    } finally {
        await prisma.$disconnect();
    }
}

void main().catch((error: unknown) => {
    // O serializer existente preserva tipo/código e omite mensagens brutas e credenciais.
    logger.error(
        { event: "sandbox.cleanup_failed", stage, err: error },
        "Limpeza do sandbox interrompida. Consulte a etapa, o tipo e o código do erro.",
    );
    process.exitCode = 1;
});
