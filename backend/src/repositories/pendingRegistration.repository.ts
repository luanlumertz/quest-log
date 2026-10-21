import { prisma } from "../lib/prisma.js";

type SavePendingRegistrationData = {
    name: string;
    email: string;
    passwordHash: string;
    codeHash: string;
    codeExpiresAt: Date;
    expiresAt: Date;
};

export function savePendingRegistration(data: SavePendingRegistrationData) {
    return prisma.pendingRegistration.upsert({
        where: {
            email: data.email,
        },
        create: data,
        update: {
            name: data.name,
            passwordHash: data.passwordHash,
            codeHash: data.codeHash,
            codeExpiresAt: data.codeExpiresAt,
            expiresAt: data.expiresAt,
            attempts: 0,
        },
    });
}
