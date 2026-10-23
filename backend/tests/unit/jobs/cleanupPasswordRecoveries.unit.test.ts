import { assert, describe, test, expect, vi, afterEach } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { startPasswordRecoveryCleanup } from "../../../src/jobs/cleanupPasswordRecoveries.js";

vi.mock("../../../src/lib/prisma.js", () => ({
    prisma: { passwordRecovery: { deleteMany: vi.fn() } },
}));

describe("startPasswordRecoveryCleanup", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test("deve remover apenas recuperações expiradas ao iniciar e a cada 30 minutos, permitindo parar", async () => {
        vi.useFakeTimers();
        vi.mocked(prisma.passwordRecovery.deleteMany).mockResolvedValue({ count: 0 });
        const log = vi.spyOn(console, "log").mockImplementation(() => {});

        const stop = startPasswordRecoveryCleanup();

        await vi.advanceTimersByTimeAsync(0);

        expect(prisma.passwordRecovery.deleteMany).toHaveBeenCalledWith({
            where: { expiresAt: { lte: expect.any(Date) } },
        });
        assert.equal(log.mock.calls.length, 0);

        vi.mocked(prisma.passwordRecovery.deleteMany).mockResolvedValueOnce({ count: 2 });

        await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

        assert.equal(vi.mocked(prisma.passwordRecovery.deleteMany).mock.calls.length, 2);
        assert.equal(log.mock.calls.length, 1);

        stop();

        await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

        assert.equal(vi.mocked(prisma.passwordRecovery.deleteMany).mock.calls.length, 2);
    });

    test("deve registrar falha na limpeza e continuar agendando as próximas execuções", async () => {
        vi.useFakeTimers();
        const error = new Error("Banco indisponível");
        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        vi.mocked(prisma.passwordRecovery.deleteMany)
            .mockRejectedValueOnce(error)
            .mockResolvedValue({ count: 0 });

        const stop = startPasswordRecoveryCleanup();

        await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

        expect(log).toHaveBeenCalledWith("Erro ao limpar recuperações de senha:", error);
        assert.equal(vi.mocked(prisma.passwordRecovery.deleteMany).mock.calls.length, 2);

        stop();
    });
});
