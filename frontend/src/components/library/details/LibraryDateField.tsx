type LibraryDateFieldProps = {
    id: string;
    label: string;
    value: string;
    min?: string;
    max: string;
    error?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
    onClear: () => void;
};

export function LibraryDateField({
    id,
    label,
    value,
    min,
    max,
    error,
    disabled = false,
    onChange,
    onClear
}: LibraryDateFieldProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-widest
                    text-ink-mute
                "
            >
                {label}
            </label>

            <div className="relative mt-3">
                <span
                    aria-hidden="true"
                    className="
                        material-symbols-rounded
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-lg!
                        text-ink-mute
                    "
                >
                    calendar_month
                </span>

                <input
                    id={id}
                    type="date"
                    value={value}
                    min={min}
                    max={max}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)
                    }
                    onMouseDown={(event) => {
                        event.preventDefault();

                        event.currentTarget.showPicker();
                    }}
                    className="
                        h-11 w-full
                        cursor-pointer
                        rounded-xl
                        border
                        border-divider-bright
                        bg-surface
                        pl-10 pr-3
                        text-sm
                        font-medium
                        text-ink
                        outline-none
                        scheme-dark
                        transition-colors
                        focus:border-brand
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                />

                {value && !disabled && (
                    <button
                        type="button"
                        aria-label={`Limpar ${label.toLowerCase()}`}
                        title={`Limpar ${label.toLowerCase()}`}
                        onClick={onClear}
                        className="
                            absolute
                            right-10
                            top-1/2
                            z-10
                            flex
                            -translate-y-1/2
                            cursor-pointer
                            items-center
                            justify-center
                            text-ink-mute
                            transition-colors
                            hover:text-danger
                        "
                    >
                        <span className="material-symbols-rounded text-lg!">
                            close
                        </span>
                    </button>
                )}
            </div>

            {error && (
                <p className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
