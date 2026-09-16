import { Link } from "react-router";
import { RecentGameItem } from "./RecentGameItem";
import type { RecentGame } from "../../types/dashboard.types";

type RecentGamesProps = {
    games: RecentGame[];
};

export function RecentGames({ games }: RecentGamesProps) {
    return (
        <section className="mt-8 overflow-hidden rounded-[20px] border border-divider bg-surface">
            <div className="flex items-center justify-between border-b border-divider px-5 py-4">
                <h2 className="font-semibold text-ink">
                    Atividade recente
                </h2>

                <Link
                    to="/library"
                    className="text-sm font-medium text-brand hover:underline"
                >
                    Ver todos →
                </Link>
            </div>

            <div className="px-5">
                {games.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-sm text-ink-mute">
                            Nenhuma atividade recente ainda.
                        </p>
                    </div>
                ) : (
                    games.map((recentGame) => (
                        <RecentGameItem
                            key={recentGame.game.id}
                            game={recentGame.game}
                            platforms={recentGame.platforms}
                            status={recentGame.status}
                            rating={recentGame.rating}
                            playtimeMinutes={recentGame.playtimeMinutes}
                            updatedAt={recentGame.updatedAt}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
