import { useQuery } from "@tanstack/react-query";
import { getGameDetails, searchGames } from "../services/game.service";

export function useSearchGames(query: string, page: number) {
    const normalizedQuery = query.trim();

    return useQuery({
        queryKey: ["games", "search", normalizedQuery, page],
        queryFn: () => searchGames(normalizedQuery, page),
        enabled: normalizedQuery.length > 0,
    });
}

export function useGameDetails(externalIdParams: string | undefined) {
    const externalId = Number(externalIdParams);

    const enabled = Number.isInteger(externalId) && externalId > 0;

    return useQuery({
        queryKey: ["games", "details", enabled ? externalId : null],
        queryFn: () => getGameDetails(externalId),
        enabled,
    });
}
