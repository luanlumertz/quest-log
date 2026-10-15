import { beforeEach } from "vitest";
import { prisma } from "../../src/lib/prisma.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("Testes interrompidos: DATABASE_URL não definida.");
}

const url = new URL(databaseUrl);

const databaseName = url.pathname.slice(1);
const allowedHosts = ["localhost", "127.0.0.1", "[::1]"];

if (databaseName !== "quest_log_test" || !allowedHosts.includes(url.hostname)) {
    throw new Error(
        "Testes interrompidos: DATABASE_URL deve apontar para o banco local quest_log_test.",
    );
}

beforeEach(async () => {
    await prisma.libraryEntryPlatform.deleteMany();
    await prisma.libraryEntry.deleteMany();
    await prisma.gamePlatform.deleteMany();
    await prisma.refreshSession.deleteMany();

    await prisma.game.deleteMany();
    await prisma.platform.deleteMany();
    await prisma.user.deleteMany();
});
