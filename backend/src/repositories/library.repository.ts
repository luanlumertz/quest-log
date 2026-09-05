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