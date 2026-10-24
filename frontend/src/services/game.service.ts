import type { GameDetailsResult, GameSearchResponse } from "../types/game.types";
import { apiRequest } from "./api";

export async function searchGames(queryParam: string, page: number): Promise<GameSearchResponse> {
    const params = new URLSearchParams();

    params.set("query", queryParam.trim());
    params.set("page", String(page));

    const query = params.toString();

    const response = await apiRequest(`/games/search?${query}`);

    return response.json();
}

export async function getGameDetails(externalId: number): Promise<GameDetailsResult> {
    const response = await apiRequest(`/games/${externalId}`);

    return response.json();
}
