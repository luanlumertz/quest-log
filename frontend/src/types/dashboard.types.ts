import type { GameStatus, GameSummary } from "./game.types";
import type { Platform } from "./platform.types";

export type DashboardData = {
    stats: {
        totalGames: number;
        byStatus: {
            WANT_TO_PLAY: number;
            PLAYING: number;
            COMPLETED: number;
            ABANDONED: number;
        };
        totalPlaytimeMinutes: number;
    };
    recentGames: RecentGame[];
};

export type RecentGame = {
    game: GameSummary;
    platforms: Platform[];
    status: GameStatus;
    rating: number | null;
    playtimeMinutes: number;
    updatedAt: string;
};
