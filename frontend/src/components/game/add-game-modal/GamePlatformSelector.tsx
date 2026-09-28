import { useId } from "react";

type GamePlatformSelectorProps = {
    platforms: string[];
    selectedPlatforms: string[];
    error?: string;
    onToggle: (platform: string) => void;
};

export function GamePlatformSelector({
    platforms,
    selectedPlatforms,
    error,
    onToggle
}: GamePlatformSelectorProps) {
    const errorId = `${useId()}-error`;

    return (
        <fieldset
            className="mt-5"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
        >
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
                Plataforma(s)
            </legend>

            {platforms.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {platforms.map((platform) => {
                        const isSelected = selectedPlatforms.includes(platform);

                        return (
                            <button
                                key={platform}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => onToggle(platform)}
                                className={`
                                    rounded-lg border px-3 py-1.5
                                    text-xs font-medium
                                    transition-colors cursor-pointer
                                    ${isSelected
                                        ? "border-brand/60 bg-brand/15 text-brand"
                                        : `
                                                border-divider-bright
                                                bg-surface-raised
                                                text-ink-mute
                                                hover:border-ink-mute
                                                hover:text-ink-dim
                                            `
                                    }
                                `}
                            >
                                {platform}
                            </button>
                        );
                    })}
                </div>
                
            ) : (
                <p className="mt-3 text-sm text-ink-mute">
                    Nenhuma plataforma disponível.
                </p>
            )}

            {error && (
                <p id={errorId} className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
