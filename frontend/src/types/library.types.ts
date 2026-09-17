import type { GameStatus } from "./game.types";
import type { Platform } from "./platform.types";

export type LibraryFilters = {
    search?: string;
    status?: GameStatus;
};

export type LibraryGame = {
    id: number;
    externalId: number;
    title: string;
    coverUrl: string | null;
    releaseDate: string | null;
};

export type LibraryEntry = {
    rating: number | null;
    platforms: Platform[];
    status: GameStatus;
    playtimeMinutes: number;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    game: LibraryGame;
};

export type LibraryResponse = {
    libraryEntries: LibraryEntry[];
};
