import { Link } from "react-router";
import { GAME_STATUS_CONFIG } from "../../config/gameStatus.config";
import type { LibraryEntry } from "../../types/library.types";
import { NowPlayingCard } from "./NowPlayingCard";

type NowPlayingProps = {
    games: LibraryEntry[];
};

export function NowPlaying({ games }: NowPlayingProps) {
    const recentPlayingGames = [...games]
        .sort((a, b) => {
            const aStartedAt = a.startedAt
                ? new Date(a.startedAt).getTime()
                : 0;

            const bStartedAt = b.startedAt
                ? new Date(b.startedAt).getTime()
                : 0;

            return bStartedAt - aStartedAt;
        })
        .slice(0, 3);

    if (recentPlayingGames.length === 0) {
        return null;
    }

    return (
        <section className="mt-8">
            <div className="mb-5 flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span
                        className="size-2.5 animate-pulse rounded-full"
                        style={{
                            backgroundColor: GAME_STATUS_CONFIG.PLAYING.color,
                        }}
                    />

                    <h2 className="text-lg font-semibold text-ink">
                        Jogando agora
                    </h2>
                </div>

                {games.length > 3 && (
                    <Link
                        to="/library?status=PLAYING"
                        className="
                            text-sm
                          text-ink-mute
                            transition-colors
                          hover:text-ink
                            hover:underline
                        "
                    >
                        Mostrando 3 de {games.length}
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {recentPlayingGames.map((entry) => (
                    <NowPlayingCard
                        key={entry.game.id}
                        entry={entry}
                    />
                ))}
            </div>
        </section>
    );
}
