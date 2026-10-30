import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

function inactiveUsersWhere(cutoff: Date): Prisma.UserWhereInput {
    return {
        createdAt: { lt: cutoff },
        OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: cutoff } }],
    };
}

export async function getConnectedDatabaseName(client: Prisma.TransactionClient = prisma) {
    const [database] = await client.$queryRaw<{ name: string }[]>`
        SELECT current_database() AS name
    `;

    return database?.name;
}

export function countInactiveSandboxUsers(cutoff: Date, client: Prisma.TransactionClient = prisma) {
    return client.user.count({ where: inactiveUsersWhere(cutoff) });
}

export function deleteInactiveSandboxUsers(
    cutoff: Date,
    client: Prisma.TransactionClient = prisma,
) {
    // Reavalia a atividade ao excluir, em vez de apagar uma lista de IDs calculada antes.
    return client.user.deleteMany({ where: inactiveUsersWhere(cutoff) });
}
