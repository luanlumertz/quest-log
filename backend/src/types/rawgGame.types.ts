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