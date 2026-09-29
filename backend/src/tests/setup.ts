import { beforeEach } from "vitest";
import { prisma } from "../lib/prisma.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.includes("quest_log_test")) {
    throw new Error("Testes interrompidos: DATABASE_URL não aponta para quest_log_test.");
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
