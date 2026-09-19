import { Link } from "react-router";
import type { LibraryEntry } from "../../types/library.types";
import { GameStatusBadge } from "../ui/GameStatusBadge";

type GameDetailsLibraryActionProps = {
    libraryEntry?: LibraryEntry;
    isLibraryLoading: boolean;
};

export function GameDetailsLibraryAction({ libraryEntry, isLibraryLoading }: GameDetailsLibraryActionProps) {
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

                <GameStatusBadge status={libraryEntry.status} />
            </>
        );
    }

    return (
        <button
            type="button"
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
    );
}
