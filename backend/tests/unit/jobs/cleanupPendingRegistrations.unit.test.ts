import { describe, test, assert, expect, vi, afterEach } from "vitest";

import { prisma } from "../../../src/lib/prisma.js";
import { startPendingRegistrationCleanup } from "../../../src/jobs/cleanupPendingRegistrations.js";

vi.mock("../../../src/lib/prisma.js", () => ({
    prisma: { pendingRegistration: { deleteMany: vi.fn() } },
}));

describe("startPendingRegistrationCleanup", () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test("deve limpar ao iniciar e a cada 30 minutos, preservando registros válidos e permitindo parar", async () => {
        vi.useFakeTimers();
        vi.mocked(prisma.pendingRegistration.deleteMany).mockResolvedValue({ count: 0 });
        const log = vi.spyOn(console, "log").mockImplementation(() => {});

        const stop = startPendingRegistrationCleanup();
        await vi.advanceTimersByTimeAsync(0);

        expect(prisma.pendingRegistration.deleteMany).toHaveBeenCalledWith({
            where: { expiresAt: { lte: expect.any(Date) } },
        });
        assert.equal(log.mock.calls.length, 0);

        vi.mocked(prisma.pendingRegistration.deleteMany).mockResolvedValueOnce({ count: 2 });
        await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

        assert.equal(vi.mocked(prisma.pendingRegistration.deleteMany).mock.calls.length, 2);
        expect(log).toHaveBeenCalledWith("2 cadastro(s) temporário(s) expirado(s) removido(s).");

        stop();
        await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

        assert.equal(vi.mocked(prisma.pendingRegistration.deleteMany).mock.calls.length, 2);
    });

    test("deve registrar uma falha de limpeza e continuar agendando", async () => {
        vi.useFakeTimers();
        const error = new Error("Banco indisponível");

        vi.mocked(prisma.pendingRegistration.deleteMany)
            .mockRejectedValueOnce(error)
            .mockResolvedValue({ count: 0 });

        const log = vi.spyOn(console, "error").mockImplementation(() => {});

        const stop = startPendingRegistrationCleanup();
        await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

        expect(log).toHaveBeenCalledWith("Erro ao limpar cadastros temporários:", error);
        assert.equal(vi.mocked(prisma.pendingRegistration.deleteMany).mock.calls.length, 2);

        stop();
    });
});
