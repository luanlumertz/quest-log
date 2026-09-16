export function getStarFillPercentages(rating: number) {
    const safeRating = Math.min(Math.max(rating, 0), 5);

    return Array.from({ length: 5 }, (_, index) => {
        const percentage = (safeRating - index) * 100;

        return Math.min(Math.max(percentage, 0), 100);
    });
}
