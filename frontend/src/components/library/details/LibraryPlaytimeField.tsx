import { formatPlayTime } from "../../../utils/formatPlayTime";
import { hoursInputToMinutes, normalizeHoursInput } from "./libraryGameDetailsForm.utils";

type LibraryPlaytimeFieldProps = {
    value: string;
    error?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
    onClear: () => void;
};

export function LibraryPlaytimeField({
    value,
    error,
    disabled = false,
    onChange,
    onClear
}: LibraryPlaytimeFieldProps) {
    const playtimeMinutes = hoursInputToMinutes(value);

    const formattedPlaytime = value.trim() !== "" &&
        Number.isFinite(playtimeMinutes) ? formatPlayTime(playtimeMinutes) : null;

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const normalizedValue = normalizeHoursInput(event.target.value);

        onChange(normalizedValue);
    }

    return (
        <div>
            <label
                htmlFor="playtimeHours"
                className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-widest
                    text-ink-mute
                "
            >
                Horas jogadas
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
                    schedule
                </span>

                <input
                    id="playtimeHours"
                    type="text"
                    inputMode="decimal"
                    placeholder="ex.: 12,3"
                    spellCheck={false}
                    disabled={disabled}
                    value={value}
                    onChange={
                        handleChange
                    }
                    className="
                        h-11 w-full
                        rounded-xl
                        border
                        border-divider-bright
                        bg-surface
                        pl-10 pr-10
                        text-sm
                        font-semibold
                        text-ink
                        outline-none
                        transition-colors
                        focus:border-brand
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                />

                {value.trim() !== "" &&
                    !disabled && (
                        <button
                            type="button"
                            aria-label="Limpar horas jogadas"
                            title="Limpar horas jogadas"
                            onClick={onClear}
                            className="
                                absolute
                                right-3
                                top-1/2
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

            <p
                className={`mt-2 min-h-4 text-xs text-ink-mute ${formattedPlaytime ? "visible" : "invisible"}`}
            >
                Equivale a{" "}
                {formattedPlaytime ?? "0min"}
            </p>

            {error && (
                <p className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
