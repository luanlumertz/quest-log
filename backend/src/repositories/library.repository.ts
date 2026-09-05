import { prisma } from "../lib/prisma.js";
import type { AddGameToLibraryRepositoryData } from "../types/library.types.js";

export async function gameInUserLibraryEntryExists(userId: number, externalId: number) {
    const entry = await prisma.libraryEntry.findFirst({
        where: {
            userId,
            game: {
                externalId
            }
        },
        select: {
            gameId: true
        }
    })

    return entry !== null;
}

export function createLibraryEntry(data: AddGameToLibraryRepositoryData) {
    const createdLibraryEntry = prisma.libraryEntry.create({
        data: {
            userId: data.userId,
            gameId: data.gameId,
            status: data.status,
            startedAt: data.startedAt,
            completedAt: data.completedAt
        }
    })

    return createdLibraryEntry;
}

export function createLibraryEntryPlatform(userId: number, gameId: number, platformId: number) {
    const createdLibraryEntryPlatform = prisma.libraryEntryPlatform.create({
        data: {
            userId,
            gameId,
            platformId
        }
    })

    return createdLibraryEntryPlatform;
}

export async function getLibraryEntriesByUserId(userId: number) {
    return prisma.libraryEntry.findMany({
        where: {
            userId
        },
        select: {
            status: true,
            rating: true,
            playtimeMinutes: true,
            startedAt: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,

            game: {
                select: {
                    id: true,
                    externalId: true,
                    title: true,
                    coverUrl: true,
                    releaseDate: true
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
        }
    });
}
