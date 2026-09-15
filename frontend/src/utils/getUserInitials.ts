export function getUserInitials(name: string) {
    const names = name.trim().split(/\s+/);

    if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
    }

    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return `${firstInitial}${lastInitial}`.toUpperCase();
}
