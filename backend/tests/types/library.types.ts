import type { GameStatus } from "../../src/generated/prisma/client.js";
import type { UpdateLibraryEntryPayload as SchemaUpdateLibraryEntryPayload } from "../../src/schemas/library.schema.js";

export type LibraryEntryResponse = {
    rating: number | null;
    platforms: {
        id: number;
        name: string;
    }[];
    status: GameStatus;
    playtimeMinutes: number;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    game: {
        id: number;
        externalId: number;
        title: string;
        coverUrl: string | null;
        releaseDate: string | null;
    };
};

export type ListLibraryResponse = {
    libraryEntries: LibraryEntryResponse[];
};

export type LibraryDetailsResponse = {
    libraryEntry: LibraryEntryResponse & {
        availablePlatforms: {
            id: number;
            name: string;
        }[];
    };
};

// HTTP envia datas como texto; o schema converte essas entradas para Date.
export type UpdateLibraryEntryPayload = Omit<
    SchemaUpdateLibraryEntryPayload,
    "startedAt" | "completedAt"
> & {
    startedAt?: string | null;
    completedAt?: string | null;
};

export type UpdatedLibraryEntryResponse = {
    updatedLibraryEntry: LibraryEntryResponse;
};
