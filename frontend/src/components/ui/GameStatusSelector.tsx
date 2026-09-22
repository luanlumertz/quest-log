import { GAME_STATUS_ENTRIES } from "../../config/gameStatus.config";

import type { GameStatus } from "../../types/game.types";

type GameStatusSelectorProps = {
    value: GameStatus;
    error?: string;
    disabled?: boolean;
    onChange: (status: GameStatus) => void;
};

export function GameStatusSelector({
    value,
    error,
    disabled,
    onChange
}: GameStatusSelectorProps) {
    return (
        <fieldset disabled={disabled}>
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
                Status
            </legend>

            <div className="mt-3 grid grid-cols-2 gap-2">
                {GAME_STATUS_ENTRIES.map(
                    ([status, statusInfo]) => {
                        const isSelected =
                            value === status;

                        return (
                            <button
                                key={status}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() =>
                                    onChange(status)
                                }
                                className={`
                                    min-h-11 rounded-xl
                                    border px-3
                                    text-center text-sm font-medium
                                    transition-colors
                                    cursor-pointer
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    wrap-anywhere
                                    ${isSelected
                                        ? ""
                                        : `
                                                border-divider-bright
                                                bg-surface
                                                text-ink-mute
                                                hover:border-ink-mute
                                                hover:text-ink-dim
                                            `
                                    }
                                `}
                                style={
                                    isSelected
                                        ? {
                                            color:
                                                statusInfo.color,
                                            borderColor:
                                                `${statusInfo.color}66`,
                                            backgroundColor:
                                                `${statusInfo.color}1A`
                                        }
                                        : undefined
                                }
                            >
                                {statusInfo.label}
                            </button>
                        );
                    }
                )}
            </div>

            {error && (
                <p className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
