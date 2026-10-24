import { getRawgGameById, searchRawgGames } from "../integrations/rawg.js";

export function searchGame(query: string, page: number) {
    return searchRawgGames(query, page);
}

export function getRawgGame(id: number) {
    return getRawgGameById(id);
}
