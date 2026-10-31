import { formatRating } from "../../utils/formatRating";
import { getStarFillPercentages } from "../../utils/getStarFillPercentages";

type RatingStarsProps = {
    rating: number;
    showValue?: boolean;
    size?: "md" | "lg";
    tone?: "amber" | "gold";
};

export function RatingStars({
    rating,
    showValue = true,
    size = "md",
    tone = "amber",
}: RatingStarsProps) {
    const stars = getStarFillPercentages(rating);
    const sizeClass = size === "lg" ? "text-xl" : "text-lg";
    const colorClass = tone === "gold" ? "text-gold" : "text-amber-400";

    return (
        <div
            className={showValue ? "flex w-full items-center justify-end gap-1" : "flex shrink-0"}
            aria-label={`Nota ${rating} de 5`}
        >
            <div className="flex">
                {stars.map((fill, index) => (
                    <span key={index} className="relative inline-block" aria-hidden="true">
                        <span className={`${sizeClass} text-ink-mute`}>★</span>

                        <span
                            className={`${sizeClass} ${colorClass} absolute left-0 top-0 overflow-hidden whitespace-nowrap`}
                            style={{ width: `${fill}%` }}
                        >
                            ★
                        </span>
                    </span>
                ))}
            </div>

            {showValue && (
                <span
                    className={`w-[3ch] shrink-0 text-center text-sm font-semibold tabular-nums ${colorClass}`}
                >
                    {formatRating(rating)}
                </span>
            )}
        </div>
    );
}
