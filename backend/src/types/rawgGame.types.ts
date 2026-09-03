export type RawgGame = {
    id: number;
    name: string;
    released: string | null;
    background_image: string | null;
    platforms?: {
        platform: {
            name: string;
        };
    }[];
};

export type GameSearchResult = {
    externalId: number;
    title: string;
    releaseDate: string | null;
    coverUrl: string | null;
    platforms: string[];
};

export type RawgGameDetails = {
    id: number;
    name: string;
    background_image: string | null;
    released: string | null;
    description_raw: string | null;
    genres?: {
        name: string;
    }[];
    platforms?: {
        platform: {
            name: string;
        };
    }[];
    developers?: {
        name: string;
    }[];
    publishers?: {
        name: string;
    }[];
};

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
