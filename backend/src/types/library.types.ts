import type { GameStatus, Prisma } from "@prisma/client";
import type { libraryEntrySelect } from "../repositories/library.repository.js";

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

export type LibraryEntryData = Prisma.LibraryEntryGetPayload<{
    select: typeof libraryEntrySelect;
}>;

export type UpdateLibraryEntryData = {
    status?: GameStatus;
    rating?: number | null;
    playtimeMinutes?: number;
    startedAt?: Date | null;
    completedAt?: Date | null;
};

export type UpdateLibraryEntryServiceData = UpdateLibraryEntryData & {
    platforms?: number[];
};
