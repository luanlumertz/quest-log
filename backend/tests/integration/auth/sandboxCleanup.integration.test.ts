import { describe, expect, test } from "vitest";
import { prisma } from "../../../src/lib/prisma.js";
import {
    countInactiveSandboxUsers,
    deleteInactiveSandboxUsers,
    getConnectedDatabaseName,
} from "../../../src/repositories/sandboxCleanup.repository.js";
import { createAuthenticatedAgent, createRegisteredUser } from "../../fixtures/auth.fixture.js";
import {
    createLibraryDataForUser,
    createLibraryEntryForExistingGame,
} from "../../fixtures/library.fixture.js";

const cutoff = new Date("2026-09-30T00:00:00.000Z");
const oldDate = new Date("2026-08-01T00:00:00.000Z");
const recentDate = new Date("2026-10-01T00:00:00.000Z");

describe("Persistência da limpeza de contas inativas", () => {
    test("deve selecionar somente contas com mais de trinta dias sem atividade e sem alterar dados ao contar", async () => {
        await prisma.user.createMany({
            data: [
                {
                    name: "Inativo",
                    email: "inactive@example.test",
                    passwordHash: "hash",
                    createdAt: oldDate,
                    lastActiveAt: oldDate,
                },
                {
                    name: "Legado",
                    email: "legacy@example.test",
                    passwordHash: "hash",
                    createdAt: oldDate,
                    lastActiveAt: null,
                },
                {
                    name: "Ativo",
                    email: "active@example.test",
                    passwordHash: "hash",
                    createdAt: oldDate,
                    lastActiveAt: recentDate,
                },
                {
                    name: "Limite de atividade",
                    email: "activity-boundary@example.test",
                    passwordHash: "hash",
                    createdAt: oldDate,
                    lastActiveAt: cutoff,
                },
                {
                    name: "Limite de criação",
                    email: "creation-boundary@example.test",
                    passwordHash: "hash",
                    createdAt: cutoff,
                    lastActiveAt: null,
                },
                {
                    name: "Nova conta",
                    email: "new@example.test",
                    passwordHash: "hash",
                    createdAt: recentDate,
                    lastActiveAt: null,
                },
                {
                    name: "Atividade inconsistente",
                    email: "inconsistent@example.test",
                    passwordHash: "hash",
                    createdAt: recentDate,
                    lastActiveAt: oldDate,
                },
            ],
        });

        const candidates = await countInactiveSandboxUsers(cutoff);
        const afterCount = await prisma.user.count();
        const deleted = await deleteInactiveSandboxUsers(cutoff);
        const survivors = await prisma.user.findMany({ select: { email: true } });

        expect(candidates).toBe(2);
        expect(afterCount).toBe(7);
        expect(deleted.count).toBe(2);
        expect(survivors.map((user) => user.email).sort()).toEqual([
            "active@example.test",
            "activity-boundary@example.test",
            "creation-boundary@example.test",
            "inconsistent@example.test",
            "new@example.test",
        ]);
        expect(await getConnectedDatabaseName()).toBe("quest_log_test");
    });

    test("deve preservar conta que voltou a ter atividade depois da conferência", async () => {
        const { user } = await createRegisteredUser();
        await prisma.user.update({
            where: { id: user.id },
            data: { createdAt: oldDate, lastActiveAt: oldDate },
        });
        expect(await countInactiveSandboxUsers(cutoff)).toBe(1);

        await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: recentDate } });
        const deleted = await deleteInactiveSandboxUsers(cutoff);

        expect(deleted.count).toBe(0);
        expect(await prisma.user.findUnique({ where: { id: user.id } })).not.toBeNull();
    });

    test("deve excluir dados vinculados e preservar catálogo e biblioteca de outra pessoa", async () => {
        const { user } = await createAuthenticatedAgent();
        const { user: activeUser } = await createRegisteredUser({ email: "active@example.test" });
        const { game, selectedPlatforms } = await createLibraryDataForUser(user.id, {
            libraryEntry: { rating: 4.5 },
        });
        await createLibraryEntryForExistingGame(
            activeUser.id,
            game.id,
            selectedPlatforms.map((platform) => platform.id),
        );
        await prisma.passwordRecovery.create({
            data: {
                userId: user.id,
                codeHash: "hash",
                codeExpiresAt: recentDate,
                lastCodeSentAt: oldDate,
                sendWindowStartedAt: oldDate,
                expiresAt: recentDate,
            },
        });
        await prisma.user.update({
            where: { id: user.id },
            data: { createdAt: oldDate, lastActiveAt: oldDate },
        });

        const deleted = await deleteInactiveSandboxUsers(cutoff);

        expect(deleted.count).toBe(1);
        expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
        expect(await prisma.libraryEntry.count({ where: { userId: user.id } })).toBe(0);
        expect(await prisma.libraryEntryPlatform.count({ where: { userId: user.id } })).toBe(0);
        expect(await prisma.refreshSession.count({ where: { userId: user.id } })).toBe(0);
        expect(await prisma.passwordRecovery.count({ where: { userId: user.id } })).toBe(0);
        expect(await prisma.game.count({ where: { id: game.id } })).toBe(1);
        expect(await prisma.platform.count()).toBe(selectedPlatforms.length);
        expect(await prisma.gamePlatform.count({ where: { gameId: game.id } })).toBe(
            selectedPlatforms.length,
        );
        expect(
            await prisma.libraryEntry.count({ where: { userId: activeUser.id, gameId: game.id } }),
        ).toBe(1);
        expect(await prisma.libraryEntryPlatform.count({ where: { userId: activeUser.id } })).toBe(
            selectedPlatforms.length,
        );
    });
});
