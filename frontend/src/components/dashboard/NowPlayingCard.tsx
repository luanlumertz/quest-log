import { DEFAULT_GAME_COVER_URL } from "../../config/game.config";
import type { LibraryEntry } from "../../types/library.types";
import { formatPlayTime } from "../../utils/formatPlayTime";
import { GameStatusBadge } from "../ui/GameStatusBadge";
import { RatingStars } from "../ui/RatingStars";

type NowPlayingCardProps = {
    entry: LibraryEntry;
};

export function NowPlayingCard({ entry }: NowPlayingCardProps) {
    const {
        game,
        status,
        rating,
        playtimeMinutes,
        platforms,
    } = entry;

    const releaseYear = game.releaseDate
        ? new Date(game.releaseDate).getFullYear()
        : null;

    const metadata = [
        releaseYear,
        ...platforms.map((platform) => platform.name),
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <article className="overflow-hidden rounded-[20px] border border-divider bg-surface transition-transform hover:-translate-y-1">
            <div className="relative h-45 overflow-hidden">
                <img
                    src={game.coverUrl ?? DEFAULT_GAME_COVER_URL}
                    alt={`Capa de ${game.title}`}
                    className="absolute inset-0 size-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#0D0F17] via-[#0D0F17]/45 to-black/20" />

                <div className="absolute right-4 top-4">
                    <GameStatusBadge status={status} />
                </div>

                <div className="absolute inset-x-5 bottom-5">
                    {metadata && (
                        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink-mute">
                            {metadata}
                        </p>
                    )}

                    <h3 className="line-clamp-2 font-display text-lg font-bold text-ink">
                        {game.title}
                    </h3>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex shrink-0 items-center gap-1.5 text-sm text-ink-mute">
                    <span className="material-symbols-rounded text-[18px]!">
                        schedule
                    </span>

                    <span className="whitespace-nowrap">
                        {formatPlayTime(playtimeMinutes)}
                    </span>
                </div>

                {rating !== null ? (
                    <RatingStars rating={rating} />
                ) : (
                    <span className="text-sm text-ink-mute">
                        Sem nota
                    </span>
                )}
            </div>
        </article>
    );
}
