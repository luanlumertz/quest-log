export function formatPlayTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const minutesLeft = minutes % 60;

    if (hours === 0) {
        return `${minutesLeft}min`;
    }

    if (minutesLeft === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutesLeft}min`;
}
