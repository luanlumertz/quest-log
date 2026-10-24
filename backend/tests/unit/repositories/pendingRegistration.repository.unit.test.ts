import { describe, test, assert, expect, vi, beforeEach } from "vitest";
import { Prisma } from "../../../src/generated/prisma/client.js";

import { prisma } from "../../../src/lib/prisma.js";
import { savePendingRegistration } from "../../../src/repositories/pendingRegistration.repository.js";

vi.mock("../../../src/lib/prisma.js", () => ({ prisma: { $transaction: vi.fn() } }));

describe("savePendingRegistration: conflitos de transação", () => {
    const data = {
        name: "Teste",
        email: "teste@email.com",
        passwordHash: "hash",
        codeHash: "hash",
        codeExpiresAt: new Date(),
        expiresAt: new Date(),
    };

    beforeEach(() => vi.resetAllMocks());

    test.each(["P2034", "P2002", "P2028"])("deve repetir a transação após %s", async (code) => {
        const conflict = new Prisma.PrismaClientKnownRequestError("Conflito", {
            code,
            clientVersion: "6.17.1",
        });
        const pending = { ...data, id: "novo-id" };

        vi.mocked(prisma.$transaction)
            .mockRejectedValueOnce(conflict)
            .mockResolvedValueOnce(pending);

        assert.deepEqual(await savePendingRegistration(data), pending);
        assert.equal(vi.mocked(prisma.$transaction).mock.calls.length, 2);
    });

    test("deve limitar as repetições e retornar um conflito compreensível", async () => {
        vi.mocked(prisma.$transaction).mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError("Conflito", {
                code: "P2034",
                clientVersion: "6.17.1",
            }),
        );

        await expect(savePendingRegistration(data)).rejects.toMatchObject({ statusCode: 409 });

        assert.equal(vi.mocked(prisma.$transaction).mock.calls.length, 3);
    });

    test.each([
        new Error("Banco indisponível"),
        new Prisma.PrismaClientKnownRequestError("Outro erro", {
            code: "P1001",
            clientVersion: "6.17.1",
        }),
    ])("deve propagar falhas que não são conflitos sem repetir", async (error) => {
        vi.mocked(prisma.$transaction).mockRejectedValue(error);

        await expect(savePendingRegistration(data)).rejects.toBe(error);

        assert.equal(vi.mocked(prisma.$transaction).mock.calls.length, 1);
    });
});
