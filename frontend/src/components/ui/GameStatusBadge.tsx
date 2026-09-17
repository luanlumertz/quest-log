import type { GameStatus } from "../../types/game.types";
import { GAME_STATUS_CONFIG } from "../../config/gameStatus.config";

type GameStatusBadgeProps = {
    status: GameStatus;
};

export function GameStatusBadge({
    status,
}: GameStatusBadgeProps) {
    const statusInfo = GAME_STATUS_CONFIG[status];

    return (
        <span
            className="
                shrink-0 rounded-full border
                px-2.5 py-1
                text-center text-xs font-semibold
            "
            style={{
                color: statusInfo.color,
                borderColor: `${statusInfo.color}4D`,
                backgroundColor: `${statusInfo.color}1A`,
            }}
        >
            {statusInfo.label}
        </span>
    );
}
