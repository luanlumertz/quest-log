import "dotenv/config";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { startPendingRegistrationCleanup } from "./jobs/cleanupPendingRegistrations.js";

const PORT = process.env.PORT || process.env.PORT_LOCAL;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const stopPendingRegistrationCleanup = startPendingRegistrationCleanup();

async function shutdown() {
    console.log("Shutting down server...");

    stopPendingRegistrationCleanup();

    server.close(async () => {
        await prisma.$disconnect();

        console.log("Server closed successfully.");
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
