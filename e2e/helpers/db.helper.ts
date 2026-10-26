import { PrismaPg } from "@prisma/adapter-pg";
import type { Prisma } from "../../backend/src/generated/prisma/client.js";
import { readE2EEnvironment } from "./env.helper";

function assertTestEmail(email: string) {
    if (!/^e2e-[0-9a-f-]+@example\.test$/i.test(email)) {
        throw new Error("A preparação e a limpeza exigem um e-mail E2E gerado pela fixture.");
    }
}

export async function withE2EDatabase<T>(action: (db: Prisma.TransactionClient) => Promise<T>) {
    const { DATABASE_URL } = readE2EEnvironment();
    const { PrismaClient } = await import("../../backend/src/generated/prisma/client.js");
    const adapter = new PrismaPg({
        connectionString: DATABASE_URL,
        connectionTimeoutMillis: 5000,
    });
    const prisma = new PrismaClient({ adapter });

    try {
        return await prisma.$transaction(async (tx) => {
            // Confere o banco real antes de permitir qualquer operação E2E.
            const [database] = await tx.$queryRaw<{ name: string }[]>`
                SELECT current_database() AS name
            `;

            if (database?.name !== "quest_log_e2e") {
                throw new Error("O ambiente E2E só pode usar o banco quest_log_e2e.");
            }

            return action(tx);
        });
    } finally {
        await prisma.$disconnect();
    }
}

export async function createTestUser(data: { name: string; email: string; password: string }) {
    assertTestEmail(data.email);

    const { hashPassword } = await import("../../backend/src/lib/bcrypt.js");
    const passwordHash = await hashPassword(data.password);

    return withE2EDatabase((db) =>
        db.user.create({
            data: { name: data.name, email: data.email, passwordHash },
            select: { id: true, name: true, email: true },
        }),
    );
}

export async function deleteTestUserByEmail(email: string) {
    assertTestEmail(email);

    await withE2EDatabase(async (db) => {
        await db.pendingRegistration.deleteMany({ where: { email } });

        // As relações com Cascade removem os dados pertencentes ao usuário.
        await db.user.deleteMany({ where: { email } });
    });
}
