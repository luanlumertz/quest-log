import type { PendingRegistration } from "@prisma/client";
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
    const now = new Date();

    const cooldownLimit = new Date(now.getTime() - VERIFICATION_RESEND_COOLDOWN_MS);

    const updated = await prisma.pendingRegistration.updateMany({
        where: {
            email: data.email,
            OR: [{ expiresAt: { lte: now } }, { lastCodeSentAt: { lte: cooldownLimit } }],
        },
        data: {
            ...data,
            attempts: 0,
            lastCodeSentAt: now,
        },
    });

    if (updated.count === 1) {
        return prisma.pendingRegistration.findUniqueOrThrow({
            where: { email: data.email },
        });
    }

    return prisma.pendingRegistration.create({
        data: {
            ...data,
            lastCodeSentAt: now,
        },
    });
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
