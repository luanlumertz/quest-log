import type { GameStatus } from "../../src/generated/prisma/client.js";
import { prisma } from "../../src/lib/prisma.js";

type CreateLibraryDataForUserOptions = {
    game?: {
        externalId?: number;
        title?: string;
    };
    selectedPlatforms?: string[];
    unselectedPlatforms?: string[];
    libraryEntry?: {
        status?: GameStatus;
        rating?: number | null;
        playtimeMinutes?: number;
        startedAt?: Date | null;
        completedAt?: Date | null;
        updatedAt?: Date;
    };
};

type LibraryEntryOptions = NonNullable<CreateLibraryDataForUserOptions["libraryEntry"]>;

export async function createLibraryDataForUser(
    userId: number,
    options: CreateLibraryDataForUserOptions = {},
) {
    return prisma.$transaction(async (tx) => {
        const game = await tx.game.create({
            data: {
                externalId: options.game?.externalId ?? 123,
                title: options.game?.title ?? "Test Game",
            },
        });

        const selectedNames = options.selectedPlatforms ?? ["Test Platform"];
        const unselectedNames = options.unselectedPlatforms ?? [];

        const selectedPlatforms = [];
        const unselectedPlatforms = [];

        for (const name of [...selectedNames, ...unselectedNames]) {
            const platform = await tx.platform.create({
                data: { name },
            });

            await tx.gamePlatform.create({
                data: {
                    gameId: game.id,
                    platformId: platform.id,
                },
            });

            if (selectedNames.includes(name)) {
                selectedPlatforms.push(platform);
            } else {
                unselectedPlatforms.push(platform);
            }
        }

        const libraryEntry = await tx.libraryEntry.create({
            data: {
                userId,
                gameId: game.id,
                ...options.libraryEntry,
            },
        });

        for (const platform of selectedPlatforms) {
            await tx.libraryEntryPlatform.create({
                data: {
                    userId,
                    gameId: game.id,
                    platformId: platform.id,
                },
            });
        }

        return {
            game,
            libraryEntry,
            selectedPlatforms,
            unselectedPlatforms,
        };
    });
}

let uniqueId = 1000;

export async function createMultipleLibraryDataForUser(
    userId: number,
    entries: LibraryEntryOptions[],
) {
    const results = [];

    for (const [index, libraryEntry] of entries.entries()) {
        const id = uniqueId++;

        const result = await createLibraryDataForUser(userId, {
            game: {
                externalId: id,
                title: `Jogo ${index + 1}`,
            },
            selectedPlatforms: [`Plataforma ${id}`],
            libraryEntry,
        });

        results.push(result);
    }

    return results;
}

export function createLibraryEntryForExistingGame(
    userId: number,
    gameId: number,
    platformIds: number[],
) {
    return prisma.$transaction(async (tx) => {
        const libraryEntry = await tx.libraryEntry.create({
            data: {
                userId,
                gameId,
            },
        });

        await tx.libraryEntryPlatform.createMany({
            data: platformIds.map((platformId) => ({
                userId,
                gameId,
                platformId,
            })),
        });

        return libraryEntry;
    });
}
