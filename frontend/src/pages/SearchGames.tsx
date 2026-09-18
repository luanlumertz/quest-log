import { useEffect, useState, type SubmitEvent } from "react";
import { useSearchParams } from "react-router";
import { useSearchGames } from "../hooks/game.hook";
import { SearchGamesForm } from "../components/game/SearchGamesForm";
import { SearchGamesResults } from "../components/game/SearchGamesResults";
import { useLibrary } from "../hooks/library.hook";

export function SearchGames() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchedQuery = searchParams.get("query") ?? "";
    const [inputValue, setInputValue] = useState(searchedQuery);

    const { data: games = [], isLoading, isError, } = useSearchGames(searchedQuery);

    const { data: library = [] } = useLibrary();

    const libraryExternalIds = new Set(library.map((entry) => entry.game.externalId));

    useEffect(() => {
        setInputValue(searchedQuery);
    }, [searchedQuery]);

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedQuery = inputValue.trim();

        if (!normalizedQuery) {
            setInputValue("");
            setSearchParams({});
            return;
        }

        setSearchParams({ query: normalizedQuery, });
    }

    function handleInputChange(value: string) {
        setInputValue(value);

        if (value === "") {
            setSearchParams({});
        }
    }

    return (
        <div className="py-8">
            <h1 className="font-display text-3xl font-bold text-white">
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
                libraryExternalIds={libraryExternalIds}
            />
        </div>
    );
}
