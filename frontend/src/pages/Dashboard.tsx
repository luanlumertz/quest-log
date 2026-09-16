import { DashboardStats } from "../components/dashboard/DashboardStats";
import { RecentGames } from "../components/dashboard/RecentGames";
import { useAuth } from "../contexts/AuthContext";
import { useDashboard } from "../hooks/dashboard.hook";
import { formatPlayTime } from "../utils/formatPlayTime";
import { getUserFirstName } from "../utils/getUserFirstName";

export function Dashboard() {
    const { data, isLoading, isError, error } = useDashboard();
    const { user } = useAuth();

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
                playing={data?.stats.byStatus.PLAYING ?? 0}
                completed={data?.stats.byStatus.COMPLETED ?? 0}
                wantToPlay={data?.stats.byStatus.WANT_TO_PLAY ?? 0}
                abandoned={data?.stats.byStatus.ABANDONED ?? 0}
                totalPlaytime={data?.stats.totalPlaytimeMinutes ? formatPlayTime(data.stats.totalPlaytimeMinutes) : "0h"}
            />

            <RecentGames
                games={data?.recentGames ?? []}
            />
        </div>
    );
}
