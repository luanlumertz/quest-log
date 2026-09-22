import { DEFAULT_GAME_COVER_URL } from "../../../config/game.config";
import type { LibraryEntryDetails } from "../../../types/library.types";
import { formatDate } from "../../../utils/formatDate";

type LibraryGameSummaryProps = {
    entry: LibraryEntryDetails;
    developers: string;
};

export function LibraryGameSummary({ entry, developers }: LibraryGameSummaryProps) {
    const coverUrl = entry.game.coverUrl ?? DEFAULT_GAME_COVER_URL;

    return (
        <aside
            className="
                flex flex-col
                sm:flex-row sm:items-start sm:gap-8
                lg:flex-col lg:gap-0
            "
        >
            <div
                className="
                    aspect-3/4
                    w-full max-w-sm
                    shrink-0
                    overflow-hidden
                    rounded-2xl
                    border border-divider
                    sm:w-96
                    lg:w-full
                    lg:max-w-none
                "
            >
                <img
                    src={coverUrl}
                    alt={`Capa de ${entry.game.title}`}
                    className="size-full object-cover"
                />
            </div>

            <div
                className="
                    mt-5 space-y-4
                    sm:mt-0 sm:self-end
                    lg:mt-5 lg:self-start
                "
            >
                <div>
                    <p
                        className="
                            text-[10px] font-semibold
                            uppercase tracking-widest
                          text-ink-mute
                            sm:text-xs
                            lg:text-[10px]
                        "
                    >
                        Desenvolvedor
                    </p>

                    <p className="mt-1 text-sm sm:text-base lg:text-sm text-ink-dim wrap-anywhere">
                        {developers}
                    </p>
                </div>

                <div>
                    <p
                        className="
                            text-[10px] font-semibold
                            uppercase tracking-widest
                          text-ink-mute
                            sm:text-xs
                            lg:text-[10px]
                    "
                    >
                        Adicionado em
                    </p>

                    <p className="mt-1 text-sm sm:text-base lg:text-sm text-ink-dim">
                        {formatDate(entry.createdAt)}
                    </p>
                </div>
            </div>
        </aside>
    );
}
