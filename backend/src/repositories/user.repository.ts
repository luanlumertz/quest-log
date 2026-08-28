import { prisma } from "../lib/prisma.js"
import type { CreateUserData } from "../types/CreateUserData.js";

export async function findUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email },
    });
}

export async function createUser(data: CreateUserData) {
    const createdUser = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash
        }
    })

    return createdUser;
}