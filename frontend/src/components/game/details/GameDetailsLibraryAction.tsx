import { useState } from "react";

import type { GameDetailsResult } from "../../../types/game.types";
import type { LibraryEntry } from "../../../types/library.types";

import { AddGameToLibraryModal } from "../add-game-modal/AddGameToLibraryModal";
import { GameStatusBadge } from "../../ui/GameStatusBadge";
import { MaterialIcon } from "../../ui/MaterialIcon";
import { Button, ButtonLink } from "../../ui/Button";
import { Alert } from "../../ui/Alert";

type GameDetailsLibraryActionProps = {
    game: GameDetailsResult;
    libraryEntry?: LibraryEntry;
    isLibraryLoading: boolean;
    isLibraryError: boolean;
    isLibraryFetching: boolean;
    onRetryLibrary: () => void;
};

export function GameDetailsLibraryAction({
    game,
    libraryEntry,
    isLibraryLoading,
    isLibraryError,
    isLibraryFetching,
    onRetryLibrary
}: GameDetailsLibraryActionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLibraryLoading) {
        return (
            <div
                className="
                    rounded-xl
                    bg-surface-raised
                    px-5 py-3
                    text-sm text-ink-mute
                "
            >
                Verificando biblioteca...
            </div>
        );
    }

    if (isLibraryError) {
        return (
            <Alert>
                <div>
                    <p>
                        Não foi possível verificar sua biblioteca.
                    </p>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onRetryLibrary}
                        isLoading={isLibraryFetching}
                        loadingText="Tentando..."
                        className="mt-3"
                    >
                        Tentar novamente
                    </Button>
                </div>
            </Alert>
        );
    }

    if (libraryEntry) {
        return (
            <>
                <ButtonLink
                    to={`/library/${libraryEntry.game.id}`}
                >
                    <MaterialIcon
                        name="library_books"
                        className="text-xl!"
                    />

                    Ver na minha biblioteca
                </ButtonLink>

                <GameStatusBadge
                    status={libraryEntry.status}
                />
            </>
        );
    }

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
            >
                <MaterialIcon
                    name="library_add"
                    className="text-xl!"
                />

                Adicionar à biblioteca
            </Button>

            <AddGameToLibraryModal
                game={game}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
