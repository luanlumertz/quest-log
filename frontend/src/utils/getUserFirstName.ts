export function getUserFirstName(name: string): string {
    const names = name.trim().split(/\s+/);

    return names[0]
}
