import type { GameStatus, GameSummary } from "./game.types";
import type { Platform } from "./platform.types";

export type LibraryFilters = {
    search?: string;
    status?: GameStatus;
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
    game: GameSummary;
};

export type LibraryResponse = {
    libraryEntries: LibraryEntry[];
};
