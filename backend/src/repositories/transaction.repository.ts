import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export function runInTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(callback);
}
