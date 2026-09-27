import { DashboardStats } from "../components/dashboard/DashboardStats";
import { NowPlaying } from "../components/dashboard/NowPlaying";
import { RecentGames } from "../components/dashboard/RecentGames";
import { StatusBreakdown } from "../components/dashboard/StatusBreakdown";

import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { StateView } from "../components/ui/StateView";

import { useAuth } from "../contexts/AuthContext";

import { useDashboard } from "../hooks/dashboard.hook";
import { useLibrary } from "../hooks/library.hook";

import { formatPlayTime } from "../utils/formatPlayTime";
import { getUserFirstName } from "../utils/getUserFirstName";

export function Dashboard() {
    const { user } = useAuth();
    const { data, isLoading, isError, isFetching, refetch } = useDashboard();
    const {
        data: playingGames,
        isLoading: isPlayingLoading,
        isError: isPlayingError,
        isFetching: isPlayingFetching,
        refetch: refetchPlaying
    } = useLibrary({ status: "PLAYING" });

    if (isLoading) {
        return (
            <LoadingState label="Carregando Dashboard..." />
        );
    }

    if (isError) {
        return (
            <StateView
                icon="error"
                tone="danger"
                title="Não foi possível carregar o Dashboard"
                description="Tente novamente em alguns instantes."
                action={
                    <Button
                        isLoading={isFetching}
                        loadingText="Tentando..."
                        onClick={() => void refetch()}
                    >
                        Tentar novamente
                    </Button>
                }
            />
        );
    }

    return (
        <div>
            <h1
                className="
                    mt-8
                    max-w-md
                    font-display
                    text-4xl
                    font-bold
                    leading-tight
                    text-white
                "
            >
                Bem-vindo de volta,{" "}
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
                <LoadingState
                    label="Carregando jogos em andamento..."
                    className="mt-8 min-h-0! py-10"
                />
            ) : isPlayingError ? (
                <StateView
                    icon="error"
                    tone="danger"
                    title="Não foi possível carregar os jogos em andamento"
                    description="O restante do Dashboard continua disponível."
                    className="mt-8 min-h-0! rounded-[20px] border border-divider bg-surface py-8"
                    action={
                        <Button
                            variant="secondary"
                            size="sm"
                            isLoading={isPlayingFetching}
                            loadingText="Tentando..."
                            onClick={() => void refetchPlaying()}
                        >
                            Tentar novamente
                        </Button>
                    }
                />
            ) : (
                <NowPlaying
                    games={playingGames ?? []}
                />
            )}

            <div className="my-8 grid grid-cols-1 gap-8 lg:grid-cols-[2.3fr_1fr]">
                <RecentGames
                    games={data?.recentGames ?? []}
                    totalGames={data?.stats.totalGames ?? 0}
                />

                <StatusBreakdown
                    byStatus={data?.stats.byStatus}
                    totalGames={data?.stats.totalGames}
                />
            </div>
        </div>
    );
}
