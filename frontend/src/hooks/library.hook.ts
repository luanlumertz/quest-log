import { useQuery } from "@tanstack/react-query";
import type { LibraryFilters } from "../types/library.types";
import { getLibrary } from "../services/library.service";

export function useLibrary(filters?: LibraryFilters) {
    return useQuery({
        queryKey: ["library", filters],
        queryFn: () => getLibrary(filters)
    })
}
