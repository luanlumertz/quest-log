import { prisma } from "../lib/prisma.js"
import type { CreateUserData } from "../types/auth.types.js";

export function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
    });
}

export function findUserById(id: number) {
    return prisma.user.findUnique({
        where: { id }
    })
}

export function createUser(data: CreateUserData) {
    const createdUser = prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash
        }
    })

    return createdUser;
}
