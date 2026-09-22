import type { Platform } from "../../../types/platform.types";

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
    return (
        <fieldset disabled={disabled}>
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
                                <span className="material-symbols-rounded text-sm!">
                                    check
                                </span>
                            )}

                            {platform.name}
                        </button>
                    );
                })}
            </div>

            {error && (
                <p className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
