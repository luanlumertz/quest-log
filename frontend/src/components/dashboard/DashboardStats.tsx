import { StatCard } from "./StatCard";

type DashboardStatsProps = {
    totalGames: number;
    playing: number;
    completed: number;
    wantToPlay: number;
    abandoned: number;
    totalPlaytime: string;
};

export function DashboardStats({
    totalGames,
    playing,
    completed,
    wantToPlay,
    abandoned,
    totalPlaytime,
}: DashboardStatsProps) {
    return (
        <div className="mt-10 grid grid-cols-1 gap-3 min-[320px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4">
            <StatCard
                label="Total de jogos"
                content={totalGames}
                variant="purple"
            />

            <StatCard
                label="Jogando"
                content={playing}
                variant="green"
            />

            <StatCard
                label="Zerados"
                content={completed}
                variant="pink"
            />

            <StatCard
                label="Quero jogar"
                content={wantToPlay}
                variant="blue"
            />

            <StatCard
                label="Abandonados"
                content={abandoned}
                variant="orange"
            />

            <StatCard
                label="Total de horas"
                content={`${totalPlaytime}`}
                variant="orange"
            />
        </div>
    );
}
