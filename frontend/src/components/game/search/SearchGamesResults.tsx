import type { GameSearchResult } from "../../../types/game.types";

import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { LoadingState } from "../../ui/LoadingState";
import { StateView } from "../../ui/StateView";

import { SearchGameCard } from "./SearchGameCard";

type SearchGamesResultsProps = {
    searchedQuery: string;
    games: GameSearchResult[];

    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    onRetry: () => void;

    libraryExternalIds?: Set<number>;
    isLibraryError: boolean;
    isLibraryFetching: boolean;
    onRetryLibrary: () => void;
};

export function SearchGamesResults({
    searchedQuery,
    games,

    isLoading,
    isError,
    isFetching,
    onRetry,

    libraryExternalIds,
    isLibraryError,
    isLibraryFetching,
    onRetryLibrary
}: SearchGamesResultsProps) {
    if (!searchedQuery) {
        return (
            <StateView
                icon="search"
                title="Encontre seu próximo jogo"
                description="Pesquise pelo nome de um jogo para começar."
                className="mt-8"
            />
        );
    }

    if (isLoading) {
        return (
            <LoadingState
                label="Buscando jogos..."
                className="mt-8"
            />
        );
    }

    if (isError) {
        return (
            <StateView
                icon="error"
                tone="danger"
                title="Não foi possível buscar os jogos"
                description="Tente novamente em alguns instantes."
                className="mt-8"
                action={
                    <Button
                        isLoading={isFetching}
                        loadingText="Tentando..."
                        onClick={onRetry}
                    >
                        Tentar novamente
                    </Button>
                }
            />
        );
    }

    if (games.length === 0) {
        return (
            <StateView
                icon="search_off"
                title="Nenhum jogo encontrado"
                description={
                    <>
                        Não encontramos resultados para{" "}
                        <span className="font-medium text-ink">
                            "{searchedQuery}"
                        </span>
                        . Tente pesquisar por outro nome.
                    </>
                }
                className="mt-8"
            />
        );
    }

    return (
        <section className="mt-8">
            <p className="mb-2 text-sm text-ink-mute">
                Resultados para "{searchedQuery}"
            </p>

            <p className="mb-6 text-xs text-ink-mute">
                Mostrando até 10 resultados. Tente uma busca mais específica caso não encontre o jogo desejado.
            </p>

            {isLibraryError && (
                <Alert className="mb-6">
                    <div>
                        <p>
                            Não foi possível verificar quais jogos já estão na sua biblioteca.
                        </p>

                        <p className="mt-1 text-xs opacity-80">
                            Os resultados da busca continuam disponíveis normalmente.
                        </p>

                        <Button
                            variant="secondary"
                            size="sm"
                            isLoading={isLibraryFetching}
                            loadingText="Tentando..."
                            onClick={onRetryLibrary}
                            className="mt-3"
                        >
                            Tentar novamente
                        </Button>
                    </div>
                </Alert>
            )}

            <div
                className="
                    grid grid-cols-1
                    gap-4
                    min-[320px]:grid-cols-2
                    sm:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                "
            >
                {games.map((game) => (
                    <SearchGameCard
                        key={game.externalId}
                        game={game}
                        isInLibrary={libraryExternalIds?.has(game.externalId)}
                    />
                ))}
            </div>
        </section>
    );
}
