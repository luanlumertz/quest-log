import { randomUUID } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/AppError.js";
import type { PendingRegistration } from "../generated/prisma/client.js";
import { MAX_VERIFICATION_ATTEMPTS, VERIFICATION_RESEND_COOLDOWN_MS } from "../constants/auth.js";
import { prisma } from "../lib/prisma.js";

type SavePendingRegistrationData = {
    name: string;
    email: string;
    passwordHash: string;
    codeHash: string;
    codeExpiresAt: Date;
    expiresAt: Date;
};

export async function savePendingRegistration(data: SavePendingRegistrationData) {
    // Serializable impede que uma confirmação concorrente passe despercebida.
    // Em caso de conflito, a transação inteira precisa ler os dados novamente.
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await prisma.$transaction(
                async (tx) => {
                    const existingUser = await tx.user.findUnique({
                        where: { email: data.email },
                    });

                    if (existingUser) {
                        throw new AppError("Este e-mail já está em uso", 409);
                    }

                    const now = new Date();
                    const registration = {
                        ...data,
                        id: randomUUID(),
                        attempts: 0,
                        createdAt: now,
                        lastCodeSentAt: now,
                    };

                    // Renova também a chave primária, invalidando a tentativa anterior.
                    return tx.pendingRegistration.upsert({
                        where: { email: data.email },
                        create: registration,
                        update: registration,
                    });
                },
                { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
            );
        } catch (error) {
            if (
                !(error instanceof Prisma.PrismaClientKnownRequestError) ||
                !["P2034", "P2002", "P2028"].includes(error.code)
            ) {
                throw error;
            }
        }
    }

    throw new AppError("Não foi possível iniciar o cadastro neste momento. Tente novamente.", 409);
}

export function findPendingRegistrationById(id: string) {
    return prisma.pendingRegistration.findUnique({
        where: { id },
    });
}

export function incrementVerificationAttempts(id: string, codeHash: string) {
    const now = new Date();

    return prisma.pendingRegistration.updateMany({
        where: {
            id,
            codeHash,
            attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
            codeExpiresAt: { gt: now },
            expiresAt: { gt: now },
        },
        data: {
            attempts: { increment: 1 },
        },
    });
}

export function completePendingRegistration(pending: PendingRegistration) {
    return prisma.$transaction(async (tx) => {
        const now = new Date();

        const deleted = await tx.pendingRegistration.deleteMany({
            where: {
                id: pending.id,
                codeHash: pending.codeHash,
                attempts: { lt: MAX_VERIFICATION_ATTEMPTS },
                codeExpiresAt: { gt: now },
                expiresAt: { gt: now },
            },
        });

        if (deleted.count !== 1) {
            return null;
        }

        return tx.user.create({
            data: {
                name: pending.name,
                email: pending.email,
                passwordHash: pending.passwordHash,
            },
        });
    });
}

export function updatePendingRegistrationCode(id: string, codeHash: string, codeExpiresAt: Date) {
    const now = new Date();

    return prisma.pendingRegistration.updateMany({
        where: {
            id,
            expiresAt: { gt: now },
            lastCodeSentAt: {
                lte: new Date(now.getTime() - VERIFICATION_RESEND_COOLDOWN_MS),
            },
        },
        data: {
            codeHash,
            codeExpiresAt,
            lastCodeSentAt: now,
            attempts: 0,
        },
    });
}

export function invalidatePendingCodeAfterEmailFailure(id: string, codeHash: string) {
    return prisma.pendingRegistration.updateMany({
        where: {
            id,
            codeHash,
        },
        data: {
            codeExpiresAt: new Date(0),
            lastCodeSentAt: new Date(0),
            attempts: 0,
        },
    });
}
