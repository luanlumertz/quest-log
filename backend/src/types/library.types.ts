import type { GameStatus } from "@prisma/client";

export type AddGameToLibraryServiceData = {
    userId: number,
    externalId: number,
    status: GameStatus,
    platforms: string[]
};

export type AddGameToLibraryRepositoryData = {
    userId: number,
    gameId: number,
    status: GameStatus,
    startedAt: Date | null,
    completedAt: Date | null
};