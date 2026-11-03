import { RatingStars } from "../../ui/RatingStars";
import { useLibraryRatingControl } from "./useLibraryRatingControl";

type LibraryRatingFieldProps = {
    value: string;
    error?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
};

const BUTTON_STEP_CLASS = `
    flex
    h-5 w-9
    touch-none
    select-none
    cursor-pointer
    items-center
    justify-center
    rounded-md
    border
    border-divider-bright
    bg-surface
    text-[10px]
    text-ink-mute
    transition-colors
    hover:border-brand
    hover:text-brand
    active:bg-surface-raised
    disabled:cursor-not-allowed
    disabled:opacity-40
    sm:h-4.5
    sm:w-8
`;

export function LibraryRatingField({
    value,
    error,
    disabled = false,
    onChange,
}: LibraryRatingFieldProps) {
    const errorId = "rating-error";
    const {
        rating,
        isAtMin,
        isAtMax,
        startRepeat,
        stopRepeat,
        increaseRating,
        decreaseRating,
        increaseStep,
        decreaseStep,
    } = useLibraryRatingControl({
        value,
        disabled,
        onChange,
    });

    return (
        <div>
            <label
                htmlFor="rating"
                className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-widest
                    text-ink-mute
                "
            >
                Nota
            </label>

            <div className="mt-1 flex min-h-10 items-center gap-3">
                <RatingStars rating={rating} showValue={false} size="lg" tone="gold" />

                <div className="flex items-stretch gap-1.5">
                    <input
                        id="rating"
                        type="text"
                        inputMode="decimal"
                        value={value}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder="-"
                        spellCheck={false}
                        className="
                            h-11 w-16
                            rounded-lg
                            border
                            border-divider-bright
                            bg-surface
                            px-2
                            text-center
                            text-sm
                            font-semibold
                            text-ink
                            outline-none
                            transition-colors
                            focus:border-brand
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            sm:h-10
                        "
                    />

                    <div className="flex flex-col gap-1">
                        <button
                            type="button"
                            aria-label="Aumentar nota"
                            disabled={disabled || isAtMax}
                            onPointerDown={() => startRepeat(increaseStep)}
                            onPointerUp={stopRepeat}
                            onPointerCancel={stopRepeat}
                            onPointerLeave={stopRepeat}
                            onClick={(event) => {
                                if (event.detail === 0) {
                                    increaseRating();
                                }
                            }}
                            className={BUTTON_STEP_CLASS}
                        >
                            ▲
                        </button>

                        <button
                            type="button"
                            aria-label="Diminuir nota"
                            disabled={disabled || isAtMin}
                            onPointerDown={() => startRepeat(decreaseStep)}
                            onPointerUp={stopRepeat}
                            onPointerCancel={stopRepeat}
                            onPointerLeave={stopRepeat}
                            onClick={(event) => {
                                if (event.detail === 0) {
                                    decreaseRating();
                                }
                            }}
                            className={BUTTON_STEP_CLASS}
                        >
                            ▼
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <p id={errorId} className="mt-2 text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}
