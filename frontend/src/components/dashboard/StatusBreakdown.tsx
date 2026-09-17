import type { GameStatus } from "../../types/game.types";
import { GAME_STATUS_CONFIG } from "../../config/gameStatus.config";

type StatusBreakdownProps = {
    byStatus?: Record<GameStatus, number>;
    totalGames?: number;
};

const statusEntries = Object.entries(GAME_STATUS_CONFIG) as [
    GameStatus,
    (typeof GAME_STATUS_CONFIG)[GameStatus],
][];

export function StatusBreakdown({
    byStatus,
    totalGames = 0,
}: StatusBreakdownProps) {
    let currentAngle = 0;

    const donutSlices = [...statusEntries]
        .reverse()
        .map(([status, config]) => {
            const startAngle = currentAngle;

            const value = byStatus?.[status] ?? 0;

            currentAngle += totalGames > 0 ? (value / totalGames) * 360 : 0;

            return `${config.color} ${startAngle}deg ${currentAngle}deg`;
        });

    const donutBackground = totalGames > 0 ? `conic-gradient(${donutSlices.join(", ")})` : "#1C2230";

    return (
        <section className="rounded-[20px] border border-divider bg-surface p-6">
            <h2 className="font-semibold text-ink">
                Resumo por status
            </h2>

            <div className="mt-10 flex justify-center">
                <div
                    className="relative size-40 rounded-full"
                    style={{ background: donutBackground }}
                >
                    <div className="absolute inset-5.25 flex flex-col items-center justify-center rounded-full bg-surface">
                        <span className="text-2xl font-semibold text-ink">
                            {totalGames}
                        </span>

                        <span className="mt-1 text-[10px] tracking-[0.25em] text-ink-mute">
                            JOGOS
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-9 space-y-3">
                {statusEntries.map(([status, config]) => (
                    <div
                        key={status}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: config.color, }}
                            />

                            <span className="text-sm text-ink-mute">
                                {config.label}
                            </span>
                        </div>

                        <span className="text-sm text-ink">
                            {byStatus?.[status] ?? 0}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
