import { extendZodWithOpenApi, type OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";

export function registerGameSchemas(registry: OpenAPIRegistry) {
    extendZodWithOpenApi(z);

    const gameSummary = registry.register(
        "GameSummary",
        z.object({
            externalId: z
                .number()
                .meta({ description: "ID do jogo na RAWG; não é o ID interno do banco local." }),
            title: z.string(),
            releaseDate: z.string().nullable().meta({
                description:
                    "Data de lançamento informada pela RAWG, normalmente YYYY-MM-DD, ou null quando ausente.",
            }),
            coverUrl: z.string().nullable(),
            platforms: z
                .array(z.string())
                .meta({ description: "Nomes das plataformas disponíveis na RAWG." }),
        }),
    );

    const gameDetails = registry.register(
        "GameDetails",
        z.object({
            ...gameSummary.shape,
            description: z.string().meta({
                description: "Descrição em texto, sem HTML; vazia quando ausente na RAWG.",
            }),
            genres: z.array(z.string()),
            developers: z.array(z.string()),
            publishers: z.array(z.string()),
        }),
    );

    const gameSearchResponse = registry.register(
        "GameSearchResponse",
        z.object({
            games: z.array(gameSummary),
            page: z.number().int().positive(),
            hasPrevious: z.boolean(),
            hasNext: z.boolean(),
        }),
    );

    return { gameDetails, gameSearchResponse };
}
