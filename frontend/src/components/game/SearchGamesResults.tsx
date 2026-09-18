import type { GameSearchResult } from "../../types/game.types";
import { SearchGameCard } from "./SearchGameCard";

type SearchGamesResultsProps = {
    searchedQuery: string;
    games: GameSearchResult[];
    isLoading: boolean;
    isError: boolean;
    libraryExternalIds: Set<number>;
};

export function SearchGamesResults({
    searchedQuery,
    games,
    isLoading,
    isError,
    libraryExternalIds
}: SearchGamesResultsProps) {
    if (!searchedQuery) {
        return (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <span className="material-symbols-rounded text-5xl! text-ink-mute">
                    search
                </span>

                <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                    Encontre seu próximo jogo
                </h2>

                <p className="mt-2 text-sm text-ink-mute">
                    Pesquise pelo nome de um jogo para começar.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-sm text-ink-mute">
                    Buscando jogos...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <span className="material-symbols-rounded text-5xl! text-danger">
                    error
                </span>

                <p className="mt-4 text-sm text-ink-dim">
                    Não foi possível buscar os jogos.
                </p>
            </div>
        );
    }

    if (games.length === 0) {
        return (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <span className="material-symbols-rounded text-5xl! text-ink-mute">
                    search_off
                </span>

                <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                    Nenhum jogo encontrado
                </h2>

                <p className="mt-2 text-sm text-ink-mute">
                    Tente pesquisar por outro nome.
                </p>
            </div>
        );
    }

    return (
        <section className="mt-8">
            <p className="mb-5 text-sm text-ink-mute">
                Resultados para "{searchedQuery}"
            </p>

            <p className="mb-6 text-xs text-ink-mute">
                Mostrando até 10 resultados. Tente uma busca mais específica caso não encontre o jogo desejado.
            </p>

            <div
                className="
                    grid gap-4
                    grid-cols-1
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
                        isInLibrary={libraryExternalIds.has(game.externalId)}
                    />
                ))}
            </div>
        </section>
    );
}
