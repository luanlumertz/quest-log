import { prisma } from "../lib/prisma.js";
import type { CreateUserData } from "../types/auth.types.js";
import type { UpdateUserData } from "../schemas/auth.schema.js";
import type { Prisma } from "../generated/prisma/client.js";
import { getAppEnvironment } from "../lib/appEnvironment.js";

export function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
    });
}

export function findUserById(id: number) {
    return prisma.user.findUnique({
        where: { id },
    });
}

export function createUser(data: CreateUserData) {
    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            ...(getAppEnvironment() === "sandbox" && { lastActiveAt: new Date() }),
        },
    });
}

export async function recordSandboxActivity(
    userId: number,
    sessionVersion: number,
    client: Prisma.TransactionClient = prisma,
) {
    if (getAppEnvironment() !== "sandbox") return;

    const now = new Date();

    await client.user.updateMany({
        where: {
            id: userId,
            sessionVersion,
            OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: now } }],
        },
        data: { lastActiveAt: now },
    });
}

export function updateUserById(id: number, data: UpdateUserData) {
    return prisma.user.update({
        where: {
            id,
        },
        data,
    });
}

export function deleteUserById(id: number) {
    return prisma.user.delete({
        where: {
            id,
        },
    });
}
