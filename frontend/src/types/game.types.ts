export const GAME_STATUSES = [
    "WANT_TO_PLAY",
    "PLAYING",
    "COMPLETED",
    "ABANDONED"
] as const;

export type GameStatus = typeof GAME_STATUSES[number];

export type GameSummary = {
    id: number;
    title: string;
    coverUrl: string | null;
}

export type GameSearchResult = {
    externalId: number;
    title: string;
    releaseDate: string | null;
    coverUrl: string | null;
    platforms: string[];
}

export type GameDetailsResult = {
    externalId: number;
    title: string;
    coverUrl: string | null;
    releaseDate: string | null;
    description: string;
    genres: string[];
    platforms: string[];
    developers: string[];
    publishers: string[];
};
