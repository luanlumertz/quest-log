import {
    assertSandboxCleanupEnvironment,
    parseSandboxCleanupArguments,
} from "../lib/sandboxCleanup.js";

async function main() {
    const execute = parseSandboxCleanupArguments(process.argv.slice(2));
    assertSandboxCleanupEnvironment();

    const { prisma } = await import("../lib/prisma.js");

    try {
        const { cleanupInactiveSandboxUsers } =
            await import("../services/sandboxCleanup.service.js");
        const result = await cleanupInactiveSandboxUsers({ execute });

        console.log(JSON.stringify(result));
    } finally {
        await prisma.$disconnect();
    }
}

void main().catch(() => {
    // Não imprime erros de conexão que possam conter credenciais ou dados pessoais.
    console.error(
        "Limpeza do sandbox interrompida. Confira ambiente, argumentos, conexão e migrations. Nenhuma execução deve ser considerada concluída sem o resumo de sucesso.",
    );
    process.exitCode = 1;
});
