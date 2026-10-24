import { AppError } from "../errors/AppError.js";
import { findPlatformsByGameId } from "../repositories/platform.repository.js";

export async function validateSelectedPlatforms(gameId: number, selectedPlatforms: string[]) {
    const availablePlatforms = await findPlatformsByGameId(gameId);

    const unavailablePlatforms = selectedPlatforms.filter(
        (namePlatform) => !availablePlatforms.some((platform) => platform.name === namePlatform),
    );

    if (unavailablePlatforms.length > 0) {
        const platformsText = unavailablePlatforms.join(", ");

        throw new AppError(
            `Plataforma(s) não disponível(is) para este jogo: ${platformsText}`,
            400,
        );
    }

    return availablePlatforms;
}

export async function validateLibraryEntryPlatformIds(gameId: number, platformIds: number[]) {
    if (platformIds.length === 0) {
        return;
    }

    const uniquePlatforms = new Set(platformIds);

    if (uniquePlatforms.size !== platformIds.length) {
        throw new AppError("As plataformas não podem se repetir", 400);
    }

    const availablePlatforms = await findPlatformsByGameId(gameId);

    const availablePlatformIds = new Set(availablePlatforms.map((platform) => platform.id));

    const hasInvalidPlatform = platformIds.some(
        (platformId) => !availablePlatformIds.has(platformId),
    );

    if (hasInvalidPlatform) {
        throw new AppError(
            "Uma ou mais plataformas informadas não são suportadas por este jogo",
            400,
        );
    }
}
