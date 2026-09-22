import { useNavigate, useParams } from "react-router";
import { useLibraryEntry, useUpdateLibraryEntry } from "../hooks/library.hook";
import { useGameDetails } from "../hooks/game.hook";
import { LibraryGameSummary } from "../components/library/details/LibraryGameSummary";
import { LibraryGameDetailsForm } from "../components/library/details/LibraryGameDetailsForm";

export function LibraryGameDetails() {
    const { gameId } = useParams();

    const navigate = useNavigate();

    const numericGameId = Number(gameId);

    const isValidGameId = Number.isInteger(numericGameId) && numericGameId > 0;

    const { data: entry, isLoading, isError, isFetching, refetch } = useLibraryEntry(gameId);

    const { mutateAsync: updateEntry, isPending: isSaving } = useUpdateLibraryEntry(gameId);

    const externalId = entry?.game.externalId;

    const { data: gameDetails, isLoading: isGameDetailsLoading } = useGameDetails(externalId?.toString());

    if (!isValidGameId) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-sm text-danger">
                    ID do jogo inválido.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-sm text-ink-mute">
                    Carregando jogo...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-80 flex-col items-center justify-center">
                <p className="text-sm text-danger">
                    Não foi possível carregar o jogo.
                </p>

                <button
                    type="button"
                    disabled={isFetching}
                    onClick={() => refetch()}
                    className="
                        mt-3
                        text-sm font-semibold
                        text-brand
                        cursor-pointer
                        hover:underline
                        disabled:opacity-50
                    "
                >
                    {isFetching ? "Tentando..." : "Tentar novamente"}
                </button>
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="flex min-h-80 items-center justify-center">
                <p className="text-sm text-ink-mute">
                    Jogo não encontrado na biblioteca.
                </p>
            </div>
        );
    }

    const releaseYear = entry.game.releaseDate ? entry.game.releaseDate.slice(0, 4) : null;

    const developers = isGameDetailsLoading ? "Carregando..." : gameDetails?.developers.length
        ? gameDetails.developers.join(", ")
        : "Não informado";

    return (
        <div className="mx-auto max-w-4xl py-6 lg:py-8">
            <button
                type="button"
                onClick={() => navigate("/library")}
                className="
                    flex items-center gap-1
                    text-sm text-ink-mute
                    transition-colors
                    cursor-pointer
                    hover:text-ink
                    hover:scale-105
                "
            >
                <span className="material-symbols-rounded text-lg!">
                    chevron_left
                </span>

                Voltar para biblioteca
            </button>

            <div
                className="
                    mt-7 grid gap-8
                    lg:grid-cols-[190px_minmax(0,1fr)]
                    lg:gap-8
                "
            >
                <LibraryGameSummary
                    entry={entry}
                    developers={developers}
                />

                <section className="min-w-0">
                    {releaseYear && (
                        <p
                            className="
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-widest
                                text-ink-mute
                            "
                        >
                            {releaseYear}
                        </p>
                    )}

                    <h1
                        className="
                            mt-1
                            font-display
                            text-3xl
                            font-bold
                            leading-tight
                            text-white
                            sm:text-4xl
                        "
                    >
                        {entry.game.title}
                    </h1>

                    <LibraryGameDetailsForm
                        key={entry.game.id}
                        entry={entry}
                        isSaving={isSaving}
                        onSave={updateEntry}
                    />
                </section>
            </div>
        </div>
    );
}
