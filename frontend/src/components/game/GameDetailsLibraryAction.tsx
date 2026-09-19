import { useState } from "react";
import { Link } from "react-router";

import type { GameDetailsResult } from "../../types/game.types";
import type { LibraryEntry } from "../../types/library.types";

import { GameStatusBadge } from "../ui/GameStatusBadge";
import { AddGameToLibraryModal } from "./add-game-modal/AddGameToLibraryModal";

type GameDetailsLibraryActionProps = {
    game: GameDetailsResult;
    libraryEntry?: LibraryEntry;
    isLibraryLoading: boolean;
};

export function GameDetailsLibraryAction({ game, libraryEntry, isLibraryLoading }: GameDetailsLibraryActionProps) {
    const [isModalOpen, setIsModalOpen] =
        useState(false);

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

    if (libraryEntry) {
        return (
            <>
                <Link
                    to={`/library/${libraryEntry.game.id}`}
                    className="
                        flex items-center gap-2
                        rounded-xl
                        bg-brand
                        px-5 py-3
                        text-sm font-semibold
                        text-white
                        transition-colors
                        hover:bg-brand-dim
                    "
                >
                    <span className="material-symbols-rounded text-xl!">
                        library_books
                    </span>

                    Ver na minha biblioteca
                </Link>

                <GameStatusBadge
                    status={libraryEntry.status}
                />
            </>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="
                    flex items-center gap-2
                    rounded-xl
                    bg-brand
                    px-5 py-3
                    text-sm font-semibold
                    text-white
                    transition-colors
                    hover:bg-brand-dim
                    cursor-pointer
                "
            >
                <span className="material-symbols-rounded text-xl!">
                    library_add
                </span>

                Adicionar à biblioteca
            </button>

            <AddGameToLibraryModal
                game={game}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
