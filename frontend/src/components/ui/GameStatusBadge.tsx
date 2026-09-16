import type { GameStatus } from "../../types/game.types";

type GameStatusBadgeProps = {
    status: GameStatus;
};

const statusConfig: Record<
    GameStatus,
    {
        label: string;
        className: string;
    }
> = {
    PLAYING: {
        label: "Jogando",
        className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },

    COMPLETED: {
        label: "Zerado",
        className: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    },

    WANT_TO_PLAY: {
        label: "Quero jogar",
        className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    },

    ABANDONED: {
        label: "Abandonado",
        className: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    },
};

export function GameStatusBadge({ status }: GameStatusBadgeProps) {
    const statusInfo = statusConfig[status];

    return (
        <span
            className={`
                shrink-0 rounded-full border
                px-2.5 py-1
                text-center text-xs font-semibold
                ${statusInfo.className}
            `}
        >
            {statusInfo.label}
        </span>
    );
}
