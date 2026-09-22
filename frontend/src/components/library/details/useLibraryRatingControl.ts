import { useEffect, useRef } from "react";

const MIN_RATING = 0;
const MAX_RATING = 5;
const RATING_STEP = 0.1;

const HOLD_DELAY = 350;
const REPEAT_INTERVAL = 80;

function parseRating(value: string) {
    const normalizedValue = value.trim().replace(",", ".");

    const parsedValue = Number(normalizedValue);

    if (!Number.isFinite(parsedValue)) {
        return 0;
    }

    return Math.min(MAX_RATING, Math.max(MIN_RATING, parsedValue));
}

function formatRating(value: number) {
    return value.toFixed(1).replace(".", ",");
}

type UseLibraryRatingControlParams = {
    value: string;
    disabled: boolean;
    onChange: (value: string) => void;
};

export function useLibraryRatingControl({ value, disabled, onChange }: UseLibraryRatingControlParams) {
    const repeatTimeoutRef = useRef<number | null>(null);

    const repeatIntervalRef = useRef<number | null>(null);

    const currentRatingRef = useRef(parseRating(value));

    const rating = parseRating(value);

    const isAtMin = rating <= MIN_RATING;

    const isAtMax = rating >= MAX_RATING;

    useEffect(() => {
        currentRatingRef.current = parseRating(value);
    }, [value]);

    useEffect(() => {
        return () => {
            stopRepeat();
        };
    }, []);

    function stopRepeat() {
        if (repeatTimeoutRef.current !== null) {
            window.clearTimeout(repeatTimeoutRef.current);
            repeatTimeoutRef.current = null;
        }

        if (repeatIntervalRef.current !== null) {
            window.clearInterval(repeatIntervalRef.current);
            repeatIntervalRef.current = null;
        }
    }

    function changeRating(step: number) {
        const currentRating = currentRatingRef.current;

        const nextRating = Number(Math.min(
            MAX_RATING, Math.max(MIN_RATING, currentRating + step)
        ).toFixed(1));

        if (nextRating === currentRating) {
            return false;
        }

        currentRatingRef.current = nextRating;

        onChange(formatRating(nextRating));

        if (step > 0) {
            return nextRating < MAX_RATING
        }

        return nextRating > MIN_RATING;
    }

    function startRepeat(step: number) {
        if (disabled) {
            return;
        }

        stopRepeat();

        const canContinue = changeRating(step);

        if (!canContinue) {
            return;
        }

        repeatTimeoutRef.current = window.setTimeout(() => {
            repeatIntervalRef.current = window.setInterval(() => {
                const shouldContinue = changeRating(step);
                if (!shouldContinue) {
                    stopRepeat();
                }
            },
                REPEAT_INTERVAL
            );
        },
            HOLD_DELAY
        );
    }

    return {
        rating,
        isAtMin,
        isAtMax,
        startRepeat,
        stopRepeat,
        increaseRating: () => changeRating(RATING_STEP),
        decreaseRating: () => changeRating(-RATING_STEP),
        increaseStep: RATING_STEP,
        decreaseStep: -RATING_STEP
    };
}
