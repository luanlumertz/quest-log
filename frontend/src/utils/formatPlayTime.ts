const hoursFormatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    useGrouping: false,
});

const displayHoursFormatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    useGrouping: true,
});

export function formatPlayTimeHours(minutes: number): string {
    return hoursFormatter.format(minutes / 60);
}

export function formatPlayTime(minutes: number): string {
    return `${displayHoursFormatter.format(minutes / 60)} h`;
}
