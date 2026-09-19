import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LibraryFilters } from "../types/library.types";
import { addGameToLibrary, getLibrary } from "../services/library.service";

export function useLibrary(filters?: LibraryFilters) {
    return useQuery({
        queryKey: ["library", filters],
        queryFn: () => getLibrary(filters)
    })
}

export function useAddGameToLibrary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addGameToLibrary,

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["library"]
                }),

                queryClient.invalidateQueries({
                    queryKey: ["dashboard"]
                })
            ]);
        }
    });
}
