import { Link } from "react-router";

import type { LibraryEntry } from "../../../types/library.types";
import { formatPlayTime } from "../../../utils/formatPlayTime";
import { GameStatusBadge } from "../../ui/GameStatusBadge";
import { PlatformBadges } from "./PlatformBadges";
import { DEFAULT_GAME_COVER_URL } from "../../../config/game.config";

type LibraryGameCardProps = {
    entry: LibraryEntry;
};

export function LibraryGameCard({ entry }: LibraryGameCardProps) {
    const { game, status, rating, playtimeMinutes, platforms } = entry;

    const coverUrl = game.coverUrl ?? DEFAULT_GAME_COVER_URL;

    return (
        <Link
            to={`/library/${game.id}`}
            className="
                group overflow-hidden
                rounded-2xl
                border border-divider
                bg-surface
                transition
                hover:-translate-y-1
                hover:border-divider-bright
            "
        >
            <div className="relative aspect-3/4 overflow-hidden">
                <div
                    className="
                        absolute inset-0
                        transition-transform
                        duration-300
                        group-hover:scale-105
                    "
                >
                    <img
                        src={coverUrl}
                        alt={`Capa de ${game.title}`}
                        loading="lazy"
                        decoding="async"
                        className="
                            block
                            size-full
                            object-cover
                        "
                    />

                    <div
                        className="
                            absolute inset-0
                            bg-linear-to-t
                          from-backdrop/90
                            via-transparent
                          to-black/20
                        "
                    />
                </div>

                <div className="absolute left-2 top-2">
                    <GameStatusBadge
                        status={status}
                        backgroundOpacity="99"
                        textColor="white"
                    />
                </div>

                {rating !== null && (
                    <div
                        className="
                                absolute bottom-2 left-2
                                flex items-center gap-1
                                text-xs font-bold text-gold
                            "
                    >
                        <span>★</span>
                        <span>{rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            <div className="p-3">
                <h2
                    className="
                            truncate
                            font-display
                            text-sm font-semibold
                            text-ink
                            sm:text-base
                        "
                    title={game.title}
                >
                    {game.title}
                </h2>

                <div className="mt-3 flex min-w-0 items-center gap-2">
                    <div className="flex shrink-0 items-center gap-1 text-xs text-ink-mute">
                        <span className="material-symbols-rounded text-base!">
                            schedule
                        </span>

                        <span>
                            {formatPlayTime(playtimeMinutes)}
                        </span>
                    </div>

                    <PlatformBadges platforms={platforms} />
                </div>
            </div>
        </Link>
    );
}
