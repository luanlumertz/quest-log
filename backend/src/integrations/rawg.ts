import type { GameSearchResult, RawgGame } from "../types/rawgGame.types.js";

const RAWG_API_KEY = process.env.RAWG_API_KEY

if (!RAWG_API_KEY) {
    throw new Error("RAWG_API_KEY não configurada");
}

export async function searchGames(query: string): Promise<GameSearchResult[]> {
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodedQuery}&page_size=10`);

    if (!response.ok) {
        throw new Error(`Erro na RAWG: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((game: RawgGame) => ({
        externalId: game.id,
        title: game.name,
        coverUrl: game.background_image,
        releaseDate: game.released,
        platforms: game.platforms?.map(item => item.platform.name) ?? []
    }))
}