import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useDeleteLibraryEntry, useLibraryEntry, useUpdateLibraryEntry } from "../hooks/library.hook";
import { useGameDetails } from "../hooks/game.hook";

import { LibraryGameSummary } from "../components/library/details/LibraryGameSummary";
import { LibraryGameDetailsForm } from "../components/library/details/LibraryGameDetailsForm";
import { ConfirmDeleteLibraryEntryModal } from "../components/library/details/ConfirmDeleteLibraryEntryModal";

export function LibraryGameDetails() {
    const { gameId } = useParams();

    const navigate = useNavigate();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const numericGameId = Number(gameId);

    const isValidGameId = Number.isInteger(numericGameId) && numericGameId > 0;

    const {
        data: entry,
        isLoading,
        isError,
        isFetching,
        refetch
    } = useLibraryEntry(gameId);

    const {
        mutateAsync: updateEntry,
        isPending: isSaving
    } = useUpdateLibraryEntry(gameId);

    const {
        mutateAsync: deleteEntry,
        isPending: isDeleting,
        error: deleteError,
        reset: resetDelete
    } = useDeleteLibraryEntry(gameId);

    const externalId = entry?.game.externalId;

    const {
        data: gameDetails,
        isLoading:
        isGameDetailsLoading
    } = useGameDetails(externalId?.toString());

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
                        cursor-pointer
                        text-sm
                        font-semibold
                        text-brand
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

    const developers = isGameDetailsLoading
        ? "Carregando..."
        : gameDetails?.developers.length
            ? gameDetails.developers.join(", ")
            : "Não informado";

    const genres = isGameDetailsLoading
        ? "Carregando..."
        : gameDetails?.genres.length
            ? gameDetails.genres.join(", ")
            : "Não informado";

    const publishers = isGameDetailsLoading
        ? "Carregando..."
        : gameDetails?.publishers.length
            ? gameDetails.publishers.join(", ")
            : "Não informado";

    function handleRemove() {
        resetDelete();
        setIsDeleteModalOpen(true);
    }

    function handleCancelRemove() {
        resetDelete();
        setIsDeleteModalOpen(false);
    }

    async function handleConfirmRemove() {
        try {
            await deleteEntry();

            navigate("/library");
        } catch {
            // O erro já é exibido no modal pela mutation.
        }
    }

    return (
        <>
            <div className="mx-auto max-w-4xl py-6 lg:py-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        flex
                        cursor-pointer
                        items-center
                        gap-1
                        text-sm
                        text-ink-mute
                        transition-colors
                        hover:scale-105
                        hover:text-ink
                    "
                >
                    <span className="material-symbols-rounded text-lg!">
                        chevron_left
                    </span>

                    Voltar para biblioteca
                </button>

                <div
                    className="
                        mt-7
                        grid gap-8
                        lg:grid-cols-[190px_minmax(0,1fr)]
                        lg:gap-8
                    "
                >
                    <LibraryGameSummary
                        entry={entry}
                        developers={developers}
                        genres={genres}
                        publishers={publishers}
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
                            isDeleting={isDeleting}
                            onSave={updateEntry}
                            onRemove={handleRemove}
                        />
                    </section>
                </div>
            </div>

            {isDeleteModalOpen && (
                <ConfirmDeleteLibraryEntryModal
                    gameTitle={entry.game.title}
                    isDeleting={isDeleting}
                    error={deleteError instanceof Error ? deleteError.message : undefined}
                    onConfirm={handleConfirmRemove}
                    onCancel={handleCancelRemove}
                />
            )}
        </>
    );
}
