import type { GameStatus, GameSummary } from "../../types/game.types";
import type { Platform } from "../../types/platform.types";
import { formatDate } from "../../utils/formatDate";
import { formatPlayTime } from "../../utils/formatPlayTime";
import { RatingStars } from "../ui/RatingStars";
import { GameStatusBadge } from "../ui/GameStatusBadge";
import { DEFAULT_GAME_COVER_URL } from "../../config/game.config";
import { Link } from "react-router";

type RecentGameItemProps = {
    game: GameSummary;
    platforms: Platform[];
    status: GameStatus;
    rating: number | null;
    playtimeMinutes: number;
    updatedAt: string;
};

export function RecentGameItem({
    game,
    platforms,
    status,
    rating,
    playtimeMinutes,
    updatedAt,
}: RecentGameItemProps) {
    return (
        <Link
            to={`/library/${game.id}`}
            className="
                group -mx-2 flex items-center gap-4
                rounded-xl px-2 py-4
                transition-colors duration-200
              hover:bg-white/5
                focus-visible:outline-2
              focus-visible:outline-brand
            "
        >
            <img
                src={game.coverUrl ?? DEFAULT_GAME_COVER_URL}
                alt={`Capa de ${game.title}`}
                className="h-15 w-11 shrink-0 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">
                <h3
                    className="
                        wrap-break-word font-semibold text-ink
                        transition-colors duration-200
                      group-hover:text-brand
                    "
                >
                    {game.title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
                    <GameStatusBadge status={status} />

                    <div
                        className="
                            hidden min-w-0 max-w-full
                            flex-wrap items-center
                            gap-x-2 gap-y-1
                            text-xs text-ink-mute
                            sm:flex
                        "
                    >
                        {platforms.map((platform) => (
                            <span
                                key={platform.id}
                                className="whitespace-nowrap"
                            >
                                {platform.name}
                            </span>
                        ))}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 text-xs text-ink-mute">
                        <span className="material-symbols-rounded text-[17px]!">
                            schedule
                        </span>

                        {formatPlayTime(playtimeMinutes)}
                    </div>
                </div>
            </div>

            <div className="hidden shrink-0 text-right sm:block">
                {rating !== null ? (
                    <RatingStars rating={rating} />
                ) : (
                    <span className="text-sm text-ink-mute">
                        Sem nota
                    </span>
                )}

                <p className="mt-1 text-sm text-ink-mute">
                    {formatDate(updatedAt)}
                </p>
            </div>
        </Link>
    );
}
