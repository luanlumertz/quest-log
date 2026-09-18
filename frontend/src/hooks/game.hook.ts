import { useQuery } from "@tanstack/react-query";
import { searchGames } from "../services/game.service";

export function useSearchGames(query: string){
    const normalizedQuery = query.trim();

    return useQuery({
        queryKey: ["games", "search", normalizedQuery],
        queryFn: () => searchGames(normalizedQuery),
        enabled: normalizedQuery.length > 0
    })
}
