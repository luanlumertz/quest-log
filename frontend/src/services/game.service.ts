import type { GameSearchResult } from "../types/game.types";
import { apiRequest } from "./api";

export async function searchGames(queryParam: string): Promise<GameSearchResult[]>{
    const params = new URLSearchParams();

    params.set("query", queryParam.trim());

    const query = params.toString();

    const response = await apiRequest(`/games/search?${query}`);

    return response.json();
}
