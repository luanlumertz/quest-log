import type { AddGameToLibraryData, LibraryEntry, LibraryFilters, LibraryResponse, UpdateLibraryEntryData } from "../types/library.types";
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

    const response = await apiRequest(`/library${query ? `?${query}` : ""}`);

    const data: LibraryResponse = await response.json();

    return data.libraryEntries;
}

export async function addGameToLibrary(data: AddGameToLibraryData): Promise<void> {
    await apiRequest("/library", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function getLibraryEntry(gameId: number): Promise<LibraryEntry> {
    const response = await apiRequest(`/library/${gameId}`);

    const data: { libraryEntry: LibraryEntry } = await response.json();

    return data.libraryEntry;
}

export async function updateLibraryEntry(gameId: number, data: UpdateLibraryEntryData): Promise<LibraryEntry> {
    const response = await apiRequest(`/library/${gameId}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    });

    const result: { updatedLibraryEntry: LibraryEntry; } = await response.json();

    return result.updatedLibraryEntry;
}
