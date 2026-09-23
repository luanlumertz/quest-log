import type { GameStatus } from "../../types/game.types";
import { GAME_STATUS_ENTRIES } from "../../config/gameStatus.config";
import { StatCard } from "./StatCard";

type DashboardStatsProps = {
    totalGames: number;
    byStatus?: Record<GameStatus, number>;
    totalPlaytime: string;
};

export function DashboardStats({
    totalGames,
    byStatus,
    totalPlaytime,
}: DashboardStatsProps) {
    return (
        <div className="mt-10 grid grid-cols-1 gap-3 min-[320px]:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-6">
            <StatCard
                label="Total de jogos"
                content={totalGames}
                to="/library"
            />

            {GAME_STATUS_ENTRIES.map(([status, config]) => (
                <StatCard
                    key={status}
                    label={config.label}
                    content={byStatus?.[status] ?? 0}
                    color={config.color}
                    to={`/library?status=${status}`}
                />
            ))}

            <StatCard
                label="Tempo jogado"
                content={totalPlaytime}
                fontSize="text-[22px]"
            />
        </div>
    );
}
