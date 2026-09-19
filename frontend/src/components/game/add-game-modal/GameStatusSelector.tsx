import { GAME_STATUS_ENTRIES } from "../../../config/gameStatus.config";
import type { AddGameToLibraryFormData } from "../../../schema/library.schema";

type GameStatusSelectorProps = {
    value: AddGameToLibraryFormData["status"];
    onChange: (status: AddGameToLibraryFormData["status"]) => void;
};

export function GameStatusSelector({ value, onChange }: GameStatusSelectorProps) {
    return (
        <fieldset>
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
                Status
            </legend>

            <div className="mt-3 grid grid-cols-2 gap-2">
                {GAME_STATUS_ENTRIES.map(([status, statusInfo]) => {
                    const isSelected = value === status;

                    return (
                        <button
                            key={status}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onChange(status)}
                            className={`
                                min-h-10 rounded-xl border px-3
                                text-left text-sm font-medium
                                transition-colors cursor-pointer wrap-anywhere
                                ${isSelected
                                    ? ""
                                    : `
                                            border-divider-bright
                                            bg-surface-raised
                                            text-ink-mute
                                            hover:border-ink-mute
                                            hover:text-ink-dim
                                        `
                                }
                            `}
                            style={
                                isSelected
                                    ? {
                                        color: statusInfo.color,
                                        borderColor: `${statusInfo.color}66`,
                                        backgroundColor: `${statusInfo.color}1A`
                                    }
                                    : undefined
                            }
                        >
                            {statusInfo.label}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
