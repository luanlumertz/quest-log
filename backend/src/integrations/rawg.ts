import { AppError } from "../errors/AppError.js";
import type {
    GameDetailsResult,
    GameSearchResult,
    RawgGame,
    RawgGameDetails,
} from "../types/rawgGame.types.js";

const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!RAWG_API_KEY) {
    throw new Error("RAWG_API_KEY não configurada");
}

function mapRawgGame(game: RawgGame): GameSearchResult {
    return {
        externalId: game.id,
        title: game.name,
        coverUrl: game.background_image,
        releaseDate: game.released,
        platforms: game.platforms?.map((item) => item.platform.name) ?? [],
    };
}

function mapRawgGameDetails(game: RawgGameDetails): GameDetailsResult {
    return {
        externalId: game.id,
        title: game.name,
        coverUrl: game.background_image,
        releaseDate: game.released,
        description: game.description_raw ?? "",
        genres: game.genres?.map((item) => item.name) ?? [],
        platforms: game.platforms?.map((item) => item.platform.name) ?? [],
        developers: game.developers?.map((item) => item.name) ?? [],
        publishers: game.publishers?.map((item) => item.name) ?? [],
    };
}

export async function searchRawgGames(query: string): Promise<GameSearchResult[]> {
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
        `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodedQuery}&page_size=10`,
    );

    if (!response.ok) {
        throw new AppError("Erro ao buscar jogos na RAWG", 502);
    }

    const data = await response.json();

    return data.results.map((game: RawgGame) => mapRawgGame(game));
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

    return mapRawgGameDetails(data);
}
