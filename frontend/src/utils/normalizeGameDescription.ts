export function normalizeGameDescription(description: string) {
    return description.replace(
        /#{1,6}\s*([A-Za-zÀ-ÿ])/g,
        "\n\n### $1"
    );
}
