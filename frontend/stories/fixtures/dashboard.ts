import type { RecentGame } from "../../src/types/dashboard.types";
import type { GameStatus } from "../../src/types/game.types";
import type { LibraryEntry } from "../../src/types/library.types";
import { demoLibraryEntries } from "./library";

export const demoNowPlayingGames: LibraryEntry[] = demoLibraryEntries.map((entry, index) => ({
    ...entry,
    status: "PLAYING",
    startedAt:
        index === 0 ? null : `2026-10-${String(index * 4 + 1).padStart(2, "0")}T00:00:00.000Z`,
}));

export const demoRecentGames: RecentGame[] = demoLibraryEntries.slice(0, 4).map((entry, index) => ({
    game: entry.game,
    status: entry.status,
    platforms: entry.platforms,
    rating: entry.rating,
    playtimeMinutes: entry.playtimeMinutes,
    updatedAt: `2026-10-${25 - index}T15:30:00.000Z`,
}));

export const demoDashboardStatusCounts: Record<GameStatus, number> = {
    WANT_TO_PLAY: 1,
    PLAYING: 4,
    PAUSED: 1,
    COMPLETED: 1,
    ABANDONED: 1,
};

export const emptyDashboardStatusCounts: Record<GameStatus, number> = {
    WANT_TO_PLAY: 0,
    PLAYING: 0,
    PAUSED: 0,
    COMPLETED: 0,
    ABANDONED: 0,
};
