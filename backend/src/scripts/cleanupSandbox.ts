import {
    assertSandboxCleanupEnvironment,
    parseSandboxCleanupArguments,
} from "../lib/sandboxCleanup.js";
import { logger } from "../lib/logger.js";

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
