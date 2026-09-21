import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LibraryFilters, UpdateLibraryEntryData } from "../types/library.types";
import { addGameToLibrary, getLibrary, getLibraryEntry, updateLibraryEntry } from "../services/library.service";

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

export function useLibraryEntry(gameIdParam?: string) {
    const gameId = Number(gameIdParam);

    const enabled = Number.isInteger(gameId) && gameId > 0;

    return useQuery({
        queryKey: ["library", "details", enabled ? gameId : null],
        queryFn: () => getLibraryEntry(gameId),
        enabled
    });
}

export function useUpdateLibraryEntry(gameIdParam?: string) {
    const queryClient = useQueryClient();

    const gameId = Number(gameIdParam);

    const isValidGameId = Number.isInteger(gameId) && gameId > 0;

    return useMutation({
        mutationFn: (data: UpdateLibraryEntryData) => {
            if (!isValidGameId) {
                throw new Error("ID do jogo inválido");
            }

            return updateLibraryEntry(gameId, data);
        },

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
