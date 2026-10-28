import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

async function cleanupExpiredRegistrations() {
    try {
        const result = await prisma.pendingRegistration.deleteMany({
            where: {
                expiresAt: {
                    lte: new Date(),
                },
            },
        });

        if (result.count > 0) {
            logger.info(
                { event: "registration.cleanup_completed", count: result.count },
                "Cadastros expirados removidos",
            );
        }
    } catch (error) {
        logger.error(
            { event: "registration.cleanup_failed", err: error },
            "Falha ao limpar cadastros expirados",
        );
    }
}

export function startPendingRegistrationCleanup() {
    // Limpa registros expirados que possam ter ficado no banco enquanto o backend estava desligado.
    void cleanupExpiredRegistrations();

    const interval = setInterval(() => {
        void cleanupExpiredRegistrations();
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(interval);
}
