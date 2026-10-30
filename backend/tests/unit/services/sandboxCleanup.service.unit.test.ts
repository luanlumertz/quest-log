import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { prisma } from "../../../src/lib/prisma.js";
import {
    assertSandboxCleanupEnvironment,
    parseSandboxCleanupArguments,
} from "../../../src/lib/sandboxCleanup.js";
import * as repository from "../../../src/repositories/sandboxCleanup.repository.js";
import { runInTransaction } from "../../../src/repositories/transaction.repository.js";
import { cleanupInactiveSandboxUsers } from "../../../src/services/sandboxCleanup.service.js";

vi.mock("../../../src/repositories/sandboxCleanup.repository.js", () => ({
    getConnectedDatabaseName: vi.fn(),
    countInactiveSandboxUsers: vi.fn(),
    deleteInactiveSandboxUsers: vi.fn(),
}));
vi.mock("../../../src/repositories/transaction.repository.js", () => ({
    runInTransaction: vi.fn(),
}));

describe("Limpeza de contas exclusiva do sandbox", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("APP_ENV", "sandbox");
        vi.stubEnv("DATABASE_URL", "postgresql://sandbox:fake@localhost:5432/quest_log_sandbox");
        vi.mocked(runInTransaction).mockImplementation(async (callback) => callback(prisma));
        vi.mocked(repository.getConnectedDatabaseName).mockResolvedValue("quest_log_sandbox");
        vi.mocked(repository.countInactiveSandboxUsers).mockResolvedValue(2);
        vi.mocked(repository.deleteInactiveSandboxUsers).mockResolvedValue({ count: 1 });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.useRealTimers();
    });

    test("deve somente conferir por padrão e usar um limite fixo de trinta dias", async () => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-10-30T12:00:00.000Z"));

        const result = await cleanupInactiveSandboxUsers();

        expect(result).toEqual({
            mode: "dry-run",
            database: "quest_log_sandbox",
            inactivityDays: 30,
            cutoff: "2026-09-30T12:00:00.000Z",
            candidates: 2,
            deleted: 0,
        });
        expect(repository.deleteInactiveSandboxUsers).not.toHaveBeenCalled();
    });

    test("deve exigir execução explícita e informar a quantidade realmente excluída", async () => {
        const result = await cleanupInactiveSandboxUsers({ execute: true });

        expect(result).toMatchObject({ mode: "execute", candidates: 2, deleted: 1 });
        expect(repository.deleteInactiveSandboxUsers).toHaveBeenCalledWith(
            expect.any(Date),
            prisma,
        );
    });

    test.each(["production", "development", "test"])(
        "deve bloquear o ambiente %s antes de acessar o banco",
        async (appEnvironment) => {
            vi.stubEnv("APP_ENV", appEnvironment);
            vi.stubEnv("NODE_ENV", appEnvironment);

            await expect(cleanupInactiveSandboxUsers({ execute: true })).rejects.toThrow(
                "A limpeza de contas só pode executar",
            );
            expect(runInTransaction).not.toHaveBeenCalled();
        },
    );

    test.each([
        undefined,
        "invalida",
        "postgresql://sandbox:fake@localhost/quest_log",
        "postgresql://sandbox:fake@localhost/quest_log_test",
        "https://example.com/quest_log_sandbox",
    ])("deve rejeitar conexão inadequada antes de consultar: %s", async (url) => {
        vi.stubEnv("DATABASE_URL", url);

        await expect(cleanupInactiveSandboxUsers({ execute: true })).rejects.toThrow();
        expect(runInTransaction).not.toHaveBeenCalled();
    });

    test.each(["quest_log", "quest_log_test", undefined])(
        "deve conferir o banco real e bloquear %s",
        async (database) => {
            vi.mocked(repository.getConnectedDatabaseName).mockResolvedValue(database);

            await expect(cleanupInactiveSandboxUsers({ execute: true })).rejects.toThrow(
                "a conexão real não está no banco quest_log_sandbox",
            );
            expect(repository.countInactiveSandboxUsers).not.toHaveBeenCalled();
            expect(repository.deleteInactiveSandboxUsers).not.toHaveBeenCalled();
        },
    );

    test("deve propagar falhas da exclusão para a transação não ser considerada concluída", async () => {
        const failure = new Error("Falha ao excluir");
        vi.mocked(repository.deleteInactiveSandboxUsers).mockRejectedValue(failure);

        await expect(cleanupInactiveSandboxUsers({ execute: true })).rejects.toBe(failure);
    });

    test("deve exigir NODE_ENV de produção mesmo com APP_ENV=sandbox", () => {
        vi.stubEnv("NODE_ENV", "development");

        expect(assertSandboxCleanupEnvironment).toThrow(
            "APP_ENV=sandbox exige NODE_ENV=production",
        );
    });

    test("deve aceitar conferência e execução somente pelas opções documentadas", () => {
        expect(parseSandboxCleanupArguments([])).toBe(false);
        expect(parseSandboxCleanupArguments(["--dry-run"])).toBe(false);
        expect(parseSandboxCleanupArguments(["--execute"])).toBe(true);
    });

    test.each([["--force"], ["--execute", "--dry-run"], ["--execute", "--execute"]])(
        "deve rejeitar argumentos ambíguos ou desconhecidos: %j",
        (...args) => {
            expect(() => parseSandboxCleanupArguments(args)).toThrow("A exclusão exige --execute");
        },
    );
});
