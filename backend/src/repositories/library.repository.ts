import { prisma } from "../lib/prisma.js";
import type { AddGameToLibraryRepositoryData, UpdateLibraryEntryData } from "../types/library.types.js";
import { Prisma } from "@prisma/client";

export const libraryEntrySelect = {
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
} satisfies Prisma.LibraryEntrySelect;

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

export function createLibraryEntry(data: AddGameToLibraryRepositoryData, tx: Prisma.TransactionClient) {
    const createdLibraryEntry = tx.libraryEntry.create({
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

export function createLibraryEntryPlatform(userId: number, gameId: number, platformId: number, tx: Prisma.TransactionClient) {
    const createdLibraryEntryPlatform = tx.libraryEntryPlatform.create({
        data: {
            userId,
            gameId,
            platformId
        }
    })

    return createdLibraryEntryPlatform;
}

export function findLibraryEntriesByUserId(userId: number) {
    return prisma.libraryEntry.findMany({
        where: {
            userId
        },
        select: libraryEntrySelect
    });
}

export function findLibraryEntryByUserAndGameId(userId: number, gameId: number) {
    return prisma.libraryEntry.findUnique({
        where: {
            userId_gameId: {
                userId,
                gameId
            }
        },
        select: libraryEntrySelect
    })
}

export function updateLibraryEntryByUserAndGameId(userId: number, gameId: number, data: UpdateLibraryEntryData, tx: Prisma.TransactionClient) {
    return tx.libraryEntry.update({
        where: {
            userId_gameId: {
                userId,
                gameId
            }
        },
        data
    })
}

export async function replaceLibraryEntryPlatforms(userId: number,gameId: number,platformIds: number[], tx: Prisma.TransactionClient) {
    await tx.libraryEntryPlatform.deleteMany({
        where: {
            userId,
            gameId
        }
    });

    return tx.libraryEntryPlatform.createMany({
        data: platformIds.map(platformId => ({
            userId,
            gameId,
            platformId
        }))
    });
}
