import { useId, type ReactNode } from "react";
import { MaterialIcon } from "./MaterialIcon";

type MultiSelectChipsProps<Value extends string | number> = {
    label: ReactNode;
    options: { value: Value; label: string }[];
    selectedValues: Value[];
    onToggle: (value: Value) => void;
    error?: string;
    disabled?: boolean;
    emptyMessage?: string;
    showCheck?: boolean;
    surface?: "default" | "raised";
    className?: string;
};

export function MultiSelectChips<Value extends string | number>({
    label,
    options,
    selectedValues,
    onToggle,
    error,
    disabled = false,
    emptyMessage = "Nenhuma opção disponível.",
    showCheck = false,
    surface = "default",
    className,
}: MultiSelectChipsProps<Value>) {
    const errorId = `${useId()}-error`;

    return (
        <fieldset
            className={className}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
        >
            <legend className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
                {label}
            </legend>

            {options.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {options.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => onToggle(option.value)}
                                className={`
                                    flex items-center gap-1 rounded-lg border px-3 py-1.5
                                    text-xs font-medium transition-colors cursor-pointer
                                    disabled:cursor-not-allowed disabled:opacity-60
                                    ${
                                        isSelected
                                            ? "border-brand/60 bg-brand/15 text-brand"
                                            : `border-divider-bright text-ink-mute
                                           hover:border-ink-mute hover:text-ink-dim
                                           ${surface === "raised" ? "bg-surface-raised" : "bg-surface"}`
                                    }
                                `}
                            >
                                {showCheck && isSelected && (
                                    <MaterialIcon name="check" className="text-sm!" />
                                )}
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <p className="mt-3 text-sm text-ink-mute">{emptyMessage}</p>
            )}

            {error && (
                <p id={errorId} className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
