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

export function getRecentUpdatedGamesByUserId(userId: number) {
    return prisma.libraryEntry.findMany({
        where: {
            userId
        },
        select: {
            status: true,
            rating: true,
            playtimeMinutes: true,
            updatedAt: true,
            game: {
                select: {
                    id: true,
                    title: true,
                    coverUrl: true
                }
            },
            libraryEntryPlatforms: {
                select: {
                    platform: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        },
        take: 5,
        orderBy: {
            updatedAt: "desc"
        }
    })
}
