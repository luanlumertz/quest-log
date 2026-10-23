import { prisma } from "../lib/prisma.js";

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

async function cleanupExpiredPasswordRecoveries() {
    try {
        const result = await prisma.passwordRecovery.deleteMany({
            where: { expiresAt: { lte: new Date() } },
        });

        if (result.count > 0) {
            console.log(`${result.count} recuperação(ões) de senha expirada(s) removida(s).`);
        }
    } catch (error) {
        console.error("Erro ao limpar recuperações de senha:", error);
    }
}

export function startPasswordRecoveryCleanup() {
    void cleanupExpiredPasswordRecoveries();

    const interval = setInterval(() => {
        void cleanupExpiredPasswordRecoveries();
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(interval);
}
