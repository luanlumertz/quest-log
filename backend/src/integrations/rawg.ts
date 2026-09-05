import { AppError } from "../errors/AppError.js";
import type { GameDetailsResult, GameSearchResult, RawgGame, RawgGameDetails } from "../types/rawgGame.types.js";

const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!RAWG_API_KEY) {
    throw new Error("RAWG_API_KEY não configurada");
}

export async function searchRawgGames(query: string): Promise<GameSearchResult[]> {
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
    }));
}

export async function getRawgGameById(externalId: number): Promise<GameDetailsResult> {
    const response = await fetch(`https://api.rawg.io/api/games/${externalId}?key=${RAWG_API_KEY}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new AppError("Jogo não encontrado", 404);
        }

        throw new AppError("Erro ao buscar jogo na RAWG", 502);
    }

    const data: RawgGameDetails = await response.json();

    const game: GameDetailsResult = {
        externalId: data.id,
        title: data.name,
        coverUrl: data.background_image,
        releaseDate: data.released,
        description: data.description_raw ?? "",
        genres: data.genres?.map(
            item => item.name
        ) ?? [],
        platforms: data.platforms?.map(
            item => item.platform.name
        ) ?? [],
        developers: data.developers?.map(
            item => item.name
        ) ?? [],
        publishers: data.publishers?.map(
            item => item.name
        ) ?? []
    };

    return game;
}