import { formatRating } from "../../utils/formatRating";
import { getStarFillPercentages } from "../../utils/getStarFillPercentages";

type RatingStarsProps = {
    rating: number;
};

export function RatingStars({ rating }: RatingStarsProps) {
    const stars = getStarFillPercentages(rating);

    return (
        <div
            className="flex w-full items-center justify-end gap-1"
            aria-label={`Nota ${rating} de 5`}
        >
            <div className="flex">
                {stars.map((fill, index) => (
                    <span
                        key={index}
                        className="relative inline-block"
                        aria-hidden="true"
                    >
                        <span className="text-lg text-ink-mute">
                            ★
                        </span>

                        <span
                            className="text-lg absolute left-0 top-0 overflow-hidden whitespace-nowrap text-amber-400"
                            style={{ width: `${fill}%` }}
                        >
                            ★
                        </span>
                    </span>
                ))}
            </div>

            <span className="text-sm font-semibold text-amber-400">
                {formatRating(rating)}
            </span>
        </div>
    );
}
