export function formatDate(date: string) {
    const parts = new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).formatToParts(new Date(date));

    const day = parts.find((part) => part.type === "day")?.value;

    const month = parts
        .find((part) => part.type === "month")
        ?.value.replace(".", "");

    const year = parts.find((part) => part.type === "year")?.value;

    const formattedDate = `${month} ${day}, ${year}`;

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}
