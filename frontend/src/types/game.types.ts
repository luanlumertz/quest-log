export type GameStatus =
    | "WANT_TO_PLAY"
    | "PLAYING"
    | "COMPLETED"
    | "ABANDONED";

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
