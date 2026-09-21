import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { GAME_STATUS_CONFIG } from "../config/gameStatus.config";
import { useLibrary } from "../hooks/library.hook";

import type { GameStatus } from "../types/game.types";
import type { LibraryEntry } from "../types/library.types";

import { LibraryEmptyState } from "../components/library/LibraryEmptyState";
import { LibraryFilters } from "../components/library/LibraryFilters";
import { LibraryGrid } from "../components/library/LibraryGrid";
import { LibraryNoResults } from "../components/library/LibraryNoResults";

function isGameStatus(value: string | null): value is GameStatus {
    return (
        value !== null &&
        Object.prototype.hasOwnProperty.call(
            GAME_STATUS_CONFIG,
            value
        )
    );
}

function getLibraryCounts(entries: LibraryEntry[]) {
    return {
        all: entries.length,

        WANT_TO_PLAY: entries.filter(
            (entry) => entry.status === "WANT_TO_PLAY"
        ).length,

        PLAYING: entries.filter(
            (entry) => entry.status === "PLAYING"
        ).length,

        COMPLETED: entries.filter(
            (entry) => entry.status === "COMPLETED"
        ).length,

        ABANDONED: entries.filter(
            (entry) => entry.status === "ABANDONED"
        ).length
    };
}

export function Library() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get("search") ?? "";

    const statusParam = searchParams.get("status");

    const status = isGameStatus(statusParam) ? statusParam : undefined;

    const [searchInput, setSearchInput] = useState(search);

    const filters = search || status
        ? {
            search: search || undefined,
            status
        } : undefined;

    // Resultado mostrado no grid
    const {
        data: entries = [],
        isLoading,
        isError,
        isFetching,
        refetch
    } = useLibrary(filters);

    // Biblioteca completa para contadores e empty state
    const { data: allEntries, isError: isAllLibraryError } = useLibrary();

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            const normalizedSearch = searchInput.trim();

            if (normalizedSearch === search) return;

            const nextParams = new URLSearchParams(searchParams);

            if (normalizedSearch) {
                nextParams.set("search", normalizedSearch);
            } else {
                nextParams.delete("search");
            }

            setSearchParams(nextParams, { replace: true });
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [searchInput, search, searchParams, setSearchParams]);

    function handleStatusChange(nextStatus?: GameStatus) {
        const nextParams = new URLSearchParams(searchParams);

        if (nextStatus) {
            nextParams.set("status", nextStatus);
        } else {
            nextParams.delete("status");
        }

        setSearchParams(nextParams);
    }

    function handleClearFilters() {
        setSearchInput("");
        setSearchParams({});
    }

    const counts = allEntries ? getLibraryCounts(allEntries) : undefined;

    const isLibraryEmpty = !isAllLibraryError && allEntries !== undefined && allEntries.length === 0;

    return (
        <div className="py-8">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Minha Biblioteca
            </h1>

            <LibraryFilters
                search={searchInput}
                status={status}
                counts={counts}
                onSearchChange={setSearchInput}
                onStatusChange={handleStatusChange}
            />

            {isLoading ? (
                <LibraryLoading />
            ) : isError ? (
                <div className="mt-12 text-center">
                    <p className="text-sm text-danger">
                        Não foi possível carregar sua biblioteca.
                    </p>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="
                            mt-3 text-sm font-semibold
                            text-brand
                            hover:underline
                            disabled:opacity-50
                        "
                    >
                        {isFetching ? "Tentando..." : "Tentar novamente"}
                    </button>
                </div>
            ) : isLibraryEmpty ? (
                <LibraryEmptyState />
            ) : entries.length === 0 ? (
                <LibraryNoResults
                    onClearFilters={
                        handleClearFilters
                    }
                />
            ) : (
                <LibraryGrid entries={entries} />
            )}
        </div>
    );
}

function LibraryLoading() {
    return (
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {Array.from({ length: 10 }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="
                            aspect-[3/4.9]
                            animate-pulse
                            rounded-2xl
                            bg-surface-raised
                        "
                    />
                )
            )}
        </div>
    );
}
