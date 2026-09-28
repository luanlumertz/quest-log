import { useState, type SubmitEvent } from "react";
import { useSearchParams } from "react-router";

import { useSearchGames } from "../hooks/game.hook";
import { useLibrary } from "../hooks/library.hook";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

import { SearchGamesForm } from "../components/game/search/SearchGamesForm";
import { SearchGamesResults } from "../components/game/search/SearchGamesResults";

export function SearchGames() {
    useDocumentTitle("Procurar Jogos");

    const [searchParams, setSearchParams] = useSearchParams();
    const searchedQuery = searchParams.get("query") ?? "";
    const [inputDraft, setInputDraft] = useState({ source: searchedQuery, value: searchedQuery });

    const inputValue = inputDraft.source === searchedQuery ? inputDraft.value : searchedQuery;

    const {
        data: games = [],
        isLoading,
        isError,
        isFetching,
        refetch
    } = useSearchGames(searchedQuery);

    const {
        data: library,
        isError: isLibraryError,
        isFetching: isLibraryFetching,
        refetch: refetchLibrary
    } = useLibrary();

    const libraryExternalIds = library
        ? new Set(library.map((entry) => entry.game.externalId))
        : undefined;

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedQuery = inputValue.trim();

        if (!normalizedQuery) {
            setInputDraft({ source: searchedQuery, value: "" });

            setSearchParams({});

            return;
        }

        setInputDraft({ source: normalizedQuery, value: normalizedQuery });

        setSearchParams({ query: normalizedQuery });
    }

    function handleInputChange(value: string) {
        setInputDraft({ source: searchedQuery, value });

        if (value === "") {
            setSearchParams({});
        }
    }

    return (
        <div className="py-8">
            <h1 className="font-display text-3xl! font-bold text-white">
                Procurar Jogos
            </h1>

            <SearchGamesForm
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
            />

            <SearchGamesResults
                searchedQuery={searchedQuery}
                games={games}
                isLoading={isLoading}
                isError={isError}
                isFetching={isFetching}
                onRetry={() => void refetch()}
                libraryExternalIds={libraryExternalIds}
                isLibraryError={isLibraryError}
                isLibraryFetching={isLibraryFetching}
                onRetryLibrary={() => void refetchLibrary()}
            />
        </div>
    );
}
