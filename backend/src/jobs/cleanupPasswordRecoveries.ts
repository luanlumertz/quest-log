import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

async function cleanupExpiredPasswordRecoveries() {
    try {
        const result = await prisma.passwordRecovery.deleteMany({
            where: { expiresAt: { lte: new Date() } },
        });

        if (result.count > 0) {
            logger.info(
                { event: "password.cleanup_completed", count: result.count },
                "Recuperações expiradas removidas",
            );
        }
    } catch (error) {
        logger.error(
            { event: "password.cleanup_failed", err: error },
            "Falha ao limpar recuperações expiradas",
        );
    }
}

export function startPasswordRecoveryCleanup() {
    void cleanupExpiredPasswordRecoveries();

    const interval = setInterval(() => {
        void cleanupExpiredPasswordRecoveries();
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(interval);
}
