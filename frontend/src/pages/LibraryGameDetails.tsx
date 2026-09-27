import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import {
    useDeleteLibraryEntry,
    useLibraryEntry,
    useUpdateLibraryEntry
} from "../hooks/library.hook";

import { useGameDetails } from "../hooks/game.hook";

import { LibraryGameSummary } from "../components/library/details/LibraryGameSummary";
import { LibraryGameDetailsForm } from "../components/library/details/LibraryGameDetailsForm";
import { ConfirmDeleteLibraryEntryModal } from "../components/library/details/ConfirmDeleteLibraryEntryModal";

import { BackButton } from "../components/ui/BackButton";
import { Button, ButtonLink } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { StateView } from "../components/ui/StateView";

import { ApiError } from "../services/api";
import { getErrorMessage } from "../utils/getErrorMessage";

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
        error,
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
        isLoading: isGameDetailsLoading,
        isError: isGameDetailsError,
        isFetching: isGameDetailsFetching,
        refetch: refetchGameDetails
    } = useGameDetails(externalId?.toString());

    if (!isValidGameId) {
        return (
            <StateView
                icon="search_off"
                title="Jogo não encontrado na biblioteca"
                description="O endereço acessado não corresponde a um jogo válido da sua biblioteca."
                action={
                    <ButtonLink to="/library">
                        Voltar para biblioteca
                    </ButtonLink>
                }
            />
        );
    }

    if (isLoading) {
        return (
            <LoadingState label="Carregando jogo..." />
        );
    }

    if (isError && error instanceof ApiError && error.status === 404) {
        return (
            <StateView
                icon="search_off"
                title="Jogo não encontrado na biblioteca"
                description="Este jogo pode ter sido removido da sua biblioteca."
                action={
                    <ButtonLink to="/library">
                        Voltar para biblioteca
                    </ButtonLink>
                }
            />
        );
    }

    if (isError) {
        return (
            <StateView
                icon="error"
                tone="danger"
                title="Não foi possível carregar o jogo"
                description="Tente novamente em alguns instantes."
                action={
                    <Button
                        isLoading={isFetching}
                        loadingText="Tentando..."
                        onClick={() => void refetch()}
                    >
                        Tentar novamente
                    </Button>
                }
            />
        );
    }

    if (!entry) {
        return (
            <StateView
                icon="search_off"
                title="Jogo não encontrado na biblioteca"
                description="Este jogo não está disponível na sua biblioteca."
                action={
                    <ButtonLink to="/library">
                        Voltar para biblioteca
                    </ButtonLink>
                }
            />
        );
    }

    const releaseYear = entry.game.releaseDate ? entry.game.releaseDate.slice(0, 4) : null;

    function getGameMetadata(values: string[] | undefined) {
        if (isGameDetailsLoading) {
            return "Carregando...";
        }

        if (isGameDetailsError) {
            return "Indisponível no momento";
        }

        return values?.length ? values.join(", ") : "Não informado";
    }

    const developers = getGameMetadata(gameDetails?.developers);

    const genres = getGameMetadata(gameDetails?.genres);

    const publishers = getGameMetadata(gameDetails?.publishers);

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
                <BackButton onClick={() => navigate(-1)}>
                    Voltar
                </BackButton>

                <div className="mt-7 grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-8">
                    <LibraryGameSummary
                        entry={entry}
                        developers={developers}
                        genres={genres}
                        publishers={publishers}
                        hasGameDetailsError={isGameDetailsError}
                        isGameDetailsFetching={isGameDetailsFetching}
                        onRetryGameDetails={() => void refetchGameDetails()}
                    />

                    <section className="min-w-0">
                        {releaseYear && (
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
                                {releaseYear}
                            </p>
                        )}

                        <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
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
                    error={
                        deleteError
                            ? getErrorMessage(
                                deleteError,
                                "Não foi possível remover o jogo da biblioteca."
                            )
                            : undefined
                    }
                    onConfirm={handleConfirmRemove}
                    onCancel={handleCancelRemove}
                />
            )}
        </>
    );
}
