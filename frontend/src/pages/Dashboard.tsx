import { DashboardStats } from "../components/dashboard/DashboardStats";
import { NowPlaying } from "../components/dashboard/NowPlaying";
import { RecentGames } from "../components/dashboard/RecentGames";
import { StatusBreakdown } from "../components/dashboard/StatusBreakdown";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/dashboard.hook";
import { useLibrary } from "../hooks/library.hook";
import { formatPlayTime } from "../utils/formatPlayTime";
import { getUserFirstName } from "../utils/getUserFirstName";

export function Dashboard() {
    const { user } = useAuth();
    const { data, isLoading, isError, error } = useDashboard();
    const {
        data: playingGames,
        isLoading: isPlayingLoading,
        isError: isPlayingError,
    } = useLibrary({ status: "PLAYING" });

    if (isLoading) {
        return <h1>Carregando...</h1>;
    }

    if (isError) {
        return <h1>Erro: {error.message}</h1>;
    }

    return (
        <div>
            <h1 className="mt-8 max-w-md font-display text-4xl font-bold leading-tight text-white">
                Bem vindo de volta,{" "}
                {user?.name ? getUserFirstName(user.name) : "Jogador"}
            </h1>

            <DashboardStats
                totalGames={data?.stats.totalGames ?? 0}
                byStatus={data?.stats.byStatus}
                totalPlaytime={data?.stats.totalPlaytimeMinutes
                    ? formatPlayTime(data.stats.totalPlaytimeMinutes)
                    : "0h"
                }
            />

            {isPlayingLoading ? (
                <p className="mt-8 text-sm text-ink-mute">
                    Carregando jogos em andamento...
                </p>
            ) : isPlayingError ? (
                <p className="mt-8 text-sm text-red-400">
                    Não foi possível carregar os jogos em andamento.
                </p>
            ) : (
                <NowPlaying games={playingGames ?? []} />
            )}

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[2.3fr_1fr]">
                <RecentGames
                    games={data?.recentGames ?? []}
                />

                <StatusBreakdown
                    byStatus={data?.stats.byStatus}
                    totalGames={data?.stats.totalGames}
                />
            </div>
        </div>
    );
}
