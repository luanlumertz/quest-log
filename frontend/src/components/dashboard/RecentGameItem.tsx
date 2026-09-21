import type { GameStatus, GameSummary } from "../../types/game.types";
import type { Platform } from "../../types/platform.types";
import { formatDate } from "../../utils/formatDate";
import { formatPlayTime } from "../../utils/formatPlayTime";
import { RatingStars } from "../ui/RatingStars";
import { GameStatusBadge } from "../ui/GameStatusBadge";
import { DEFAULT_GAME_COVER_URL } from "../../config/game.config";

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
        <div className="flex items-center gap-4 py-4">
            <img
                src={game.coverUrl ?? DEFAULT_GAME_COVER_URL}
                alt={`Capa de ${game.title}`}
                className="h-15 w-11 shrink-0 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-ink">
                    {game.title}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                    <GameStatusBadge status={status} />

                    <div className="hidden min-[568px]:flex items-center gap-1 text-xs text-ink-mute lg:flex">
                        {platforms.map((platform) => (
                            <span key={platform.id}>
                                {platform.name}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-ink-mute">
                        <span className="material-symbols-rounded text-[17px]!">
                            schedule
                        </span>

                        {formatPlayTime(playtimeMinutes)}
                    </div>
                </div>
            </div>

            <div className="hidden min-[368px]:block shrink-0 text-right">
                {rating !== null ? (<RatingStars rating={rating} />) : (
                    <span className="text-sm text-ink-mute">
                        Sem nota
                    </span>
                )}

                <p className="mt-1 text-sm text-ink-mute">
                    {formatDate(updatedAt)}
                </p>
            </div>
        </div>
    );
}
