import { prisma } from "../lib/prisma.js"
import type { CreateUserData, UpdateUserData } from "../types/auth.types.js";

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
    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash
        }
    })
}

export function updateUserById(id: number, data: UpdateUserData) {
    return prisma.user.update({
        where: {
            id
        },
        data
    })
}

export function deleteUserById(id: number) {
    return prisma.user.delete({
        where: {
            id
        }
    })
}
