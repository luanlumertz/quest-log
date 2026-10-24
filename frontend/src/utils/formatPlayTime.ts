const hoursFormatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    useGrouping: false,
});

export function formatPlayTimeHours(minutes: number): string {
    return hoursFormatter.format(minutes / 60);
}

export function formatPlayTime(minutes: number): string {
    return `${formatPlayTimeHours(minutes)} h`;
}
