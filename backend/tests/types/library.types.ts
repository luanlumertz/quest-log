import type { GameStatus } from "@prisma/client";

export type AddGameToLibraryData = {
    externalId: number;
    status: GameStatus;
    platforms: string[];
};

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
