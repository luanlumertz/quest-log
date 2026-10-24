import type { GameStatus } from "../../src/generated/prisma/client.js";

export type DashboardResponse = {
    dashboardData: {
        stats: {
            totalGames: number;
            byStatus: Record<GameStatus, number>;
            totalPlaytimeMinutes: number;
        };
        recentGames: {
            rating: number | null;
            platforms: {
                id: number;
                name: string;
            }[];
            status: GameStatus;
            playtimeMinutes: number;
            updatedAt: string;
            game: {
                id: number;
                title: string;
                coverUrl: string | null;
            };
        }[];
    };
};
