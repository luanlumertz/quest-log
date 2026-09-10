import { getLibraryStatsByUserId, getRecentUpdatedGamesByUserId } from "../repositories/dashboard.repository.js";

async function getLibraryStats(userId: number) {
    const libraryStats = await getLibraryStatsByUserId(userId);

    return libraryStats.reduce((stats, item) => {
        stats.totalGames += item._count._all;

        stats.byStatus[item.status] = item._count._all;

        stats.totalPlaytimeMinutes += item._sum.playtimeMinutes ?? 0;

        return stats;
    },
        {
            totalGames: 0,

            byStatus: {
                WANT_TO_PLAY: 0,
                PLAYING: 0,
                COMPLETED: 0,
                ABANDONED: 0
            },

            totalPlaytimeMinutes: 0
        }
    );
}

export async function getDashboardData(userId: number) {
    const libraryStats = await getLibraryStats(userId);

    const libraryRecentGames = await getRecentUpdatedGamesByUserId(userId);

    const formattedRecentGames = libraryRecentGames.map(recentGame => {
        const { libraryEntryPlatforms, ...game } = recentGame;

        return {
            ...game,
            rating: recentGame.rating !== null ? Number(recentGame.rating) : null,
            platforms: libraryEntryPlatforms.map(item => ({
                id: item.platform.id,
                name: item.platform.name
            }))
        };
    });

    return {
        stats: libraryStats,
        recentGames: formattedRecentGames
    };
}
