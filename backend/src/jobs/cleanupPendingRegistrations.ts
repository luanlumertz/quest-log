import { prisma } from "../lib/prisma.js";

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
            console.log(`${result.count} cadastro(s) temporário(s) expirado(s) removido(s).`);
        }
    } catch (error) {
        console.error("Erro ao limpar cadastros temporários:", error);
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
