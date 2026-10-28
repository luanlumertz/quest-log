import { z } from "zod";
import { AppError } from "../errors/AppError.js";
import type {
    GameDetailsResult,
    GameSearchResult,
    GameSearchResponse,
} from "../types/rawgGame.types.js";
import {
    rawgDetailsSchema,
    rawgSearchResponseSchema,
    type RawgGame,
    type RawgGameDetails,
} from "../schemas/rawg.schema.js";

const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!RAWG_API_KEY) {
    throw new Error("RAWG_API_KEY não configurada");
}

async function fetchRawg<T extends z.ZodType>(
    url: string,
    schema: T,
    errorMessage: string,
    notFoundMessage?: string,
): Promise<z.infer<T>> {
    const signal = AbortSignal.timeout(10_000);

    try {
        const response = await fetch(url, { signal });

        if (!response.ok) {
            if (response.status === 404 && notFoundMessage) {
                throw new AppError(notFoundMessage, 404);
            }

            throw new AppError(errorMessage, 502);
        }

        const data: unknown = await response.json();

        return schema.parse(data);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        if (signal.aborted) {
            throw new AppError("A RAWG demorou para responder. Tente novamente.", 504);
        }

        throw new AppError(errorMessage, 502);
    }
}

function mapRawgGame(game: RawgGame): GameSearchResult {
    return {
        externalId: game.id,
        title: game.name,
        coverUrl: game.background_image ?? null,
        releaseDate: game.released ?? null,
        platforms: game.platforms?.map((item) => item.platform.name) ?? [],
    };
}

function mapRawgGameDetails(game: RawgGameDetails): GameDetailsResult {
    return {
        externalId: game.id,
        title: game.name,
        coverUrl: game.background_image ?? null,
        releaseDate: game.released ?? null,
        description: game.description_raw ?? "",
        genres: game.genres?.map((item) => item.name) ?? [],
        platforms: game.platforms?.map((item) => item.platform.name) ?? [],
        developers: game.developers?.map((item) => item.name) ?? [],
        publishers: game.publishers?.map((item) => item.name) ?? [],
    };
}

export async function searchRawgGames(query: string, page = 1): Promise<GameSearchResponse> {
    const encodedQuery = encodeURIComponent(query);

    const data = await fetchRawg(
        `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodedQuery}&page_size=20&page=${page}`,
        rawgSearchResponseSchema,
        "Erro ao buscar jogos na RAWG",
    );

    return {
        games: data.results.map(mapRawgGame),
        page,
        hasPrevious: data.previous !== null,
        hasNext: data.next !== null,
    };
}

export async function getRawgGameById(externalId: number): Promise<GameDetailsResult> {
    const data = await fetchRawg(
        `https://api.rawg.io/api/games/${externalId}?key=${RAWG_API_KEY}`,
        rawgDetailsSchema,
        "Erro ao buscar jogo na RAWG",
        "Jogo não encontrado",
    );

    return mapRawgGameDetails(data);
}
