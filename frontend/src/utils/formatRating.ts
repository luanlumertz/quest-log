export function formatRating(rating: number): string {
    return Number.isInteger(rating)
        ? rating.toString()
        : rating.toFixed(1);
}
