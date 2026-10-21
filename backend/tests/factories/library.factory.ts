import type { AddGameToLibraryPayload } from "../../src/schemas/library.schema.js";

export function createLibraryPayload(
    overrides: Partial<AddGameToLibraryPayload> = {},
): AddGameToLibraryPayload {
    return {
        externalId: 123,
        status: "WANT_TO_PLAY" as const,
        platforms: ["PC"],
        ...overrides,
    };
}
