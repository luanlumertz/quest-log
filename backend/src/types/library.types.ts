import type { GameStatus, Prisma } from "../generated/prisma/client.js";
import type { libraryEntrySelect } from "../repositories/library.repository.js";
import type {
    AddGameToLibraryData,
    UpdateLibraryEntryServiceData,
} from "../schemas/library.schema.js";

export type AddGameToLibraryServiceData = AddGameToLibraryData & {
    userId: number;
};

export type AddGameToLibraryRepositoryData = {
    userId: number;
    gameId: number;
    status: GameStatus;
    startedAt: Date | null;
    completedAt: Date | null;
};

export type LibraryEntryData = Prisma.LibraryEntryGetPayload<{
    select: typeof libraryEntrySelect;
}>;

export type UpdateLibraryEntryData = Omit<UpdateLibraryEntryServiceData, "platforms">;
