import { prisma } from "../../src/lib/prisma.js";

export async function createLibraryDataForUser(userId: number) {
    return prisma.$transaction(async (tx) => {
        const game = await tx.game.create({
            data: {
                externalId: 999999,
                title: "Test Game",
            },
        });

        const platform = await tx.platform.create({
            data: {
                name: "Test Platform",
            },
        });

        const gamePlatform = await tx.gamePlatform.create({
            data: {
                gameId: game.id,
                platformId: platform.id,
            },
        });

        const libraryEntry = await tx.libraryEntry.create({
            data: {
                userId,
                gameId: game.id,
            },
        });

        const libraryEntryPlatform = await tx.libraryEntryPlatform.create({
            data: {
                userId,
                gameId: game.id,
                platformId: platform.id,
            },
        });

        return {
            game,
            platform,
            gamePlatform,
            libraryEntry,
            libraryEntryPlatform,
        };
    });
}

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
