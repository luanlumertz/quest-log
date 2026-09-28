import { useId } from "react";
import type { Platform } from "../../../types/platform.types";
import { MaterialIcon } from "../../ui/MaterialIcon";

type LibraryPlatformSelectorProps = {
    platforms: Platform[];
    selectedPlatforms: number[];
    error?: string;
    disabled?: boolean;
    onToggle: (platformId: number) => void;
};

export function LibraryPlatformSelector({
    platforms,
    selectedPlatforms,
    error,
    disabled = false,
    onToggle
}: LibraryPlatformSelectorProps) {
    const errorId = `${useId()}-error`;

    return (
        <fieldset
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
        >
            <legend
                className="
                    text-[10px] font-semibold
                    uppercase tracking-widest
                    text-ink-mute
                "
            >
                Plataforma(s) jogada(s)
            </legend>

            <div className="mt-3 flex flex-wrap gap-2">
                {platforms.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);

                    return (
                        <button
                            key={platform.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onToggle(platform.id)}
                            className={`
                                flex items-center gap-1
                                rounded-lg border
                                px-3 py-1.5
                                text-xs font-medium
                                transition-colors
                                cursor-pointer
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                ${isSelected
                                    ? `
                                            border-brand/60
                                            bg-brand/15
                                            text-brand
                                        `
                                    : `
                                            border-divider-bright
                                            bg-surface
                                            text-ink-mute
                                            hover:border-ink-mute
                                            hover:text-ink-dim
                                        `
                                }
                            `}
                        >
                            {isSelected && (
                                <MaterialIcon
                                    name="check"
                                    className="text-sm!"
                                />
                            )}

                            {platform.name}
                        </button>
                    );
                })}
            </div>

            {error && (
                <p id={errorId} className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
