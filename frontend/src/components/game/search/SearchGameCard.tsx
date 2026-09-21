import { Link } from "react-router";
import type { GameSearchResult } from "../../../types/game.types";
import { DEFAULT_GAME_COVER_URL } from "../../../config/game.config";

type SearchGameCardProps = {
    game: GameSearchResult;
    isInLibrary: boolean;
};

export function SearchGameCard({ game, isInLibrary }: SearchGameCardProps) {
    const releaseYear = game.releaseDate ? game.releaseDate.slice(0, 4) : null;

    return (
        <Link
            to={`/games/${game.externalId}`}
            className="
                group overflow-hidden rounded-2xl
                border border-divider
                bg-surface
                transition-transform
                hover:-translate-y-1
            "
        >
            <div className="relative aspect-3/4 overflow-hidden">
                {isInLibrary && (
                    <span
                        className="
                            absolute left-2 top-2 z-10
                            rounded-lg
                            border border-white/10
                          bg-black/45
                            px-2 py-1
                            text-xs font-semibold
                          text-white/85
                            backdrop-blur-sm
                        "
                    >
                        Na biblioteca
                    </span>
                )}

                <img
                    src={game.coverUrl ?? DEFAULT_GAME_COVER_URL}
                    alt={`Capa de ${game.title}`}
                    className="
                        size-full object-cover
                        transition-transform
                        duration-300
                        group-hover:scale-105
                    "
                />
            </div>

            <div className="p-3">
                <h2
                    title={game.title}
                    className="
                        line-clamp-1
                        font-display
                        font-semibold
                        text-ink
                    "
                >
                    {game.title}
                </h2>

                {releaseYear && (
                    <p className="mt-1 text-xs text-ink-mute">
                        {releaseYear}
                    </p>
                )}

                {game.platforms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {game.platforms
                            .slice(0, 2)
                            .map((platform) => (
                                <span
                                    key={platform}
                                    className="
                                        rounded-md
                                        bg-surface-raised
                                        px-2 py-1
                                        text-[10px]
                                        text-ink-mute
                                    "
                                >
                                    {platform}
                                </span>
                            ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
