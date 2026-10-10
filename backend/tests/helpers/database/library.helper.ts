import { prisma } from "../../../src/lib/prisma.js";

export function countLibraryEntriesByUserIdAndGameId(userId: number, gameId: number) {
    return prisma.libraryEntry.count({
        where: {
            userId,
            gameId,
        },
    });
}

export function countLibraryEntries() {
    return prisma.libraryEntry.count();
}

export function findLibraryEntryPlatformByUserIdGameIdAndPlatformId(
    userId: number,
    gameId: number,
    platformId: number,
) {
    return prisma.libraryEntryPlatform.findUnique({
        where: {
            userId_gameId_platformId: {
                userId,
                gameId,
                platformId,
            },
        },
    });
}

export function countLibraryEntryPlatformsByUserIdGameIdPlatformId(
    userId: number,
    gameId: number,
    platformId: number,
) {
    return prisma.libraryEntryPlatform.count({
        where: {
            userId,
            gameId,
            platformId,
        },
    });
}

export function countLibraryEntryPlatformsByUserIdAndGameId(userId: number, gameId: number) {
    return prisma.libraryEntryPlatform.count({
        where: {
            libraryEntry: {
                userId,
                gameId,
            },
        },
    });
}

export function findLibraryEntryPlatformsByUserIdAndGameId(userId: number, gameId: number) {
    return prisma.libraryEntryPlatform.findMany({
        where: {
            userId,
            gameId,
        },
    });
}
