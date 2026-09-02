import { searchRawgGames } from "../integrations/rawg.js";

export function searchGame(query: string) {
    return searchRawgGames(query);
}