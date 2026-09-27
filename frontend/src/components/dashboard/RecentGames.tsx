import { Link } from "react-router";

import type { RecentGame } from "../../types/dashboard.types";
import { StateView } from "../ui/StateView";
import { RecentGameItem } from "./RecentGameItem";
import { RecentGamesEmptyState } from "./RecentGamesEmptyState";

type RecentGamesProps = {
    games: RecentGame[];
    totalGames: number;
};

export function RecentGames({ games, totalGames }: RecentGamesProps) {
    const hasRecentGames = games.length > 0;

    return (
        <section
            className="
                flex min-w-0 flex-col
                overflow-hidden
                rounded-[20px]
                border border-divider
                bg-surface
            "
        >
            <div
                className="
                    flex items-center justify-between
                    border-b border-divider
                    px-5 py-4
                "
            >
                <h2 className="font-semibold text-ink">
                    Atividade recente
                </h2>

                {hasRecentGames && (
                    <Link
                        to="/library"
                        className="text-sm font-medium text-brand hover:underline"
                    >
                        Ver todos →
                    </Link>
                )}
            </div>

            <div className="px-5 py-3.5">
                {!hasRecentGames ? (
                    totalGames === 0 ? (
                        <RecentGamesEmptyState />
                    ) : (
                        <StateView
                            icon="schedule"
                            title="Nenhuma atividade recente"
                            description="Suas alterações recentes aparecerão aqui."
                            className="min-h-0! py-8"
                        />
                    )
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
