import z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { libraryQuerySchema, updateLibraryEntrySchema } from "../../schemas/library.schema.js";

extendZodWithOpenApi(z);

export const updateLibraryEntryRequestSchema = updateLibraryEntrySchema
    .safeExtend({
        startedAt: updateLibraryEntrySchema.shape.startedAt
            .unwrap()
            .unwrap()
            .meta({ type: "string", format: "date-time" })
            .nullable()
            .optional(),
        completedAt: updateLibraryEntrySchema.shape.completedAt
            .unwrap()
            .unwrap()
            .meta({ type: "string", format: "date-time" })
            .nullable()
            .optional(),
        platforms: updateLibraryEntrySchema.shape.platforms.meta({
            description:
                "IDs das plataformas disponíveis para o jogo. Substitui toda a seleção; [] remove todas.",
            uniqueItems: true,
        }),
    })
    .meta({ minProperties: 1 });

const libraryEntrySchema = z.object({
    status: libraryQuerySchema.shape.status.unwrap(),
    rating: z.number().min(0).max(5).multipleOf(0.1).nullable(),
    playtimeMinutes: z.number().int().min(0),
    startedAt: z.iso.datetime().nullable(),
    completedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    game: z.object({
        id: z.number().int().positive(),
        externalId: z.number().int().positive(),
        title: z.string(),
        coverUrl: z.string().nullable(),
        releaseDate: z.iso.datetime().nullable(),
    }),
    platforms: z.array(z.object({ id: z.number().int().positive(), name: z.string() })),
});

export const libraryEntryResponseSchema = libraryEntrySchema.openapi("LibraryEntry", {
    description:
        "Entrada da biblioteca retornada na listagem e na atualização. Tempo em minutos, datas ISO 8601 em UTC e plataformas selecionadas pelo usuário. game.id é o ID interno; game.externalId é o ID da RAWG.",
});

export const libraryEntryDetailsResponseSchema = libraryEntrySchema
    .extend({
        availablePlatforms: libraryEntrySchema.shape.platforms,
    })
    .openapi("LibraryEntryDetails", {
        description:
            "Detalhes da entrada, incluindo availablePlatforms com todas as plataformas associadas ao jogo no banco local. platforms contém somente as selecionadas pelo usuário.",
    });

export const createdLibraryEntryResponseSchema = libraryEntrySchema
    .omit({ game: true, platforms: true })
    .extend({
        userId: z.number().int().positive(),
        gameId: z.number().int().positive(),
        rating: z.null(),
        playtimeMinutes: z.literal(0),
        startedAt: z.null(),
        completedAt: z.null(),
        platforms: z.array(z.string()),
    })
    .openapi("CreatedLibraryEntry", {
        description:
            "Entrada recém-criada, com userId e gameId, sem objeto game. platforms contém nomes, a nota e as datas começam nulas e o tempo começa em zero.",
    });
