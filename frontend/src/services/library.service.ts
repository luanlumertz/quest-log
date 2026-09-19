import type { AddGameToLibraryData, LibraryEntry, LibraryFilters, LibraryResponse } from "../types/library.types";
import { apiRequest } from "./api";

export async function getLibrary(filters?: LibraryFilters,): Promise<LibraryEntry[]> {
    const params = new URLSearchParams();

    if (filters?.status) {
        params.set("status", filters.status);
    }

    if (filters?.search) {
        params.set("search", filters.search);
    }

    const query = params.toString();

    const response = await apiRequest(
        `/library${query ? `?${query}` : ""}`,
    );

    const data: LibraryResponse = await response.json();

    return data.libraryEntries;
}

export async function addGameToLibrary(data: AddGameToLibraryData): Promise<void> {
    await apiRequest("/library", {
        method: "POST",
        body: JSON.stringify(data)
    });
}
