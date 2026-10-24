export function getUserInitials(name: string) {
    const initials = name.split(/\s+/).flatMap((part) => part.match(/[\p{L}\p{N}]/u) ?? []);

    if (initials.length === 0) return "?";

    const first = initials[0]!;
    const last = initials.length > 1 ? initials[initials.length - 1]! : "";

    return (first + last).toUpperCase();
}
