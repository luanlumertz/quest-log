import type { GameStatus } from "../../types/game.types";
import { GAME_STATUS_CONFIG } from "../../config/gameStatus.config";
import { Link } from "react-router";

type StatusBreakdownProps = {
    byStatus?: Record<GameStatus, number>;
    totalGames?: number;
};

const statusEntries = Object.entries(GAME_STATUS_CONFIG) as [
    GameStatus,
    (typeof GAME_STATUS_CONFIG)[GameStatus],
][];

export function StatusBreakdown({ byStatus, totalGames = 0 }: StatusBreakdownProps) {
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
                    <Link
                        to="/library"
                        aria-label="Ver todos os jogos da biblioteca"
                        className="
                            group absolute inset-5.25
                            flex flex-col items-center justify-center
                            rounded-full bg-surface
                            transition-colors duration-200
                          hover:bg-surface-hover
                            focus-visible:outline-2
                          focus-visible:outline-brand
                        "
                    >
                        <span
                            className="
                                text-2xl font-semibold text-ink
                                transition-all duration-200
                                group-hover:scale-110
                            "
                        >
                            {totalGames}
                        </span>

                        <span
                            className="
                                mt-1 text-[10px] tracking-[0.25em]
                              text-ink-mute
                                transition-colors duration-200
                            "
                        >
                            JOGOS
                        </span>
                    </Link>
                </div>
            </div>

            <div className="mt-9 space-y-3">
                {statusEntries.map(([status, config]) => (
                    <Link
                        key={status}
                        to={`/library?status=${status}`}
                        className="
                            group flex items-center justify-between
                            rounded-lg px-2 py-1 -mx-2
                            transition-colors duration-200
                          hover:bg-white/5
                            focus-visible:outline-2
                          focus-visible:outline-brand
                        "
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="
                                    size-2.5 rounded-full
                                    transition-transform duration-200
                                    group-hover:scale-125
                                "
                                style={{ backgroundColor: config.color }}
                            />

                            <span className="
                                text-sm text-ink-mute
                                transition-colors duration-200
                              group-hover:text-ink
                            ">
                                {config.label}
                            </span>
                        </div>

                        <span className="text-sm text-ink">
                            {byStatus?.[status] ?? 0}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
