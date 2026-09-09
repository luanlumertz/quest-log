import { prisma } from "../lib/prisma.js";

export function getLibraryStatsByUserId(userId: number) {
    return prisma.libraryEntry.groupBy({
        by: ["status"],

        where: {
            userId
        },

        _count: {
            _all: true
        },

        _sum: {
            playtimeMinutes: true
        }
    })
}
