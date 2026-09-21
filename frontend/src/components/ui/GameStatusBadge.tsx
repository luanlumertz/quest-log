import type { GameStatus } from "../../types/game.types";
import { GAME_STATUS_CONFIG } from "../../config/gameStatus.config";

type GameStatusBadgeProps = {
    status: GameStatus;
    backgroundOpacity?: string;
    textColor?: string;
};

export function GameStatusBadge({ status, backgroundOpacity = "1A", textColor }: GameStatusBadgeProps) {
    const statusInfo = GAME_STATUS_CONFIG[status];

    return (
        <span
            className={`
                shrink-0 rounded-full border
                px-2.5 py-1
                text-center text-xs font-semibold
            `}
            style={{
                color: textColor ?? statusInfo.color,
                borderColor: `${statusInfo.color}4D`,
                backgroundColor: `${statusInfo.color}${backgroundOpacity}`,
            }}
        >
            {statusInfo.label}
        </span>
    );
}
