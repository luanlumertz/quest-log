import type { LibraryEntry } from "../../src/types/library.types";
import type { RecentGame } from "../../src/types/dashboard.types";

export const demoLibraryEntry = {
    status: "PLAYING",
    rating: 4.5,
    playtimeMinutes: 7545,
    startedAt: "2026-10-01T00:00:00.000Z",
    completedAt: null,
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-20T15:30:00.000Z",
    game: {
        id: 1,
        externalId: 58175,
        title: "Elden Ring",
        coverUrl: "/images/auth-bg.jpg",
        releaseDate: "2022-02-25T00:00:00.000Z",
    },
    platforms: [{ id: 1, name: "PC" }],
} satisfies LibraryEntry;

export const demoRecentGame = {
    game: {
        id: demoLibraryEntry.game.id,
        title: demoLibraryEntry.game.title,
        coverUrl: demoLibraryEntry.game.coverUrl,
    },
    platforms: demoLibraryEntry.platforms,
    status: demoLibraryEntry.status,
    rating: demoLibraryEntry.rating,
    playtimeMinutes: demoLibraryEntry.playtimeMinutes,
    updatedAt: demoLibraryEntry.updatedAt,
} satisfies RecentGame;

export const demoPlatforms = [
    { id: 1, name: "PC" },
    { id: 2, name: "PlayStation 5" },
    { id: 3, name: "Xbox Series S/X" },
    { id: 4, name: "PlayStation 4" },
    { id: 5, name: "Xbox One" },
];
