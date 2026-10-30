import "dotenv/config";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { startPendingRegistrationCleanup } from "./jobs/cleanupPendingRegistrations.js";
import { startPasswordRecoveryCleanup } from "./jobs/cleanupPasswordRecoveries.js";
import { waitForPasswordRecoveryEmails } from "./services/password.service.js";
import { logger } from "./lib/logger.js";
import { getAppEnvironment } from "./lib/appEnvironment.js";

const appEnvironment = getAppEnvironment();
const PORT = process.env.PORT || process.env.PORT_LOCAL;

const server = app.listen(PORT, () => {
    logger.info({ event: "server.started", port: PORT, appEnvironment }, "Servidor iniciado");
});

const stopPendingRegistrationCleanup = startPendingRegistrationCleanup();
const stopPasswordRecoveryCleanup = startPasswordRecoveryCleanup();

async function shutdown() {
    logger.info({ event: "server.stopping" }, "Encerrando servidor");

    stopPendingRegistrationCleanup();
    stopPasswordRecoveryCleanup();

    server.close(async () => {
        await waitForPasswordRecoveryEmails();
        await prisma.$disconnect();

        logger.info({ event: "server.stopped" }, "Servidor encerrado");
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
