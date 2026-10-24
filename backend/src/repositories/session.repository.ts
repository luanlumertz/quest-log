import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export function runSessionTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(callback, { maxWait: 10_000 });
}

export async function lockUserForSession(tx: Prisma.TransactionClient, userId: number) {
    const users = await tx.$queryRaw<{ id: number; sessionVersion: number }[]>`
        SELECT "id", "sessionVersion" FROM "User" WHERE "id" = ${userId} FOR UPDATE
    `;

    return users[0] ?? null;
}
