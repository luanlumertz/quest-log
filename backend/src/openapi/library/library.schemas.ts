import z from "zod";
import { libraryQuerySchema, updateLibraryEntrySchema } from "../../schemas/library.schema.js";

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

export const libraryEntryResponseSchema = z.object({
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

export const libraryEntryDetailsResponseSchema = libraryEntryResponseSchema.extend({
    availablePlatforms: libraryEntryResponseSchema.shape.platforms,
});

export const createdLibraryEntryResponseSchema = libraryEntryResponseSchema
    .omit({ game: true, platforms: true })
    .extend({
        userId: z.number().int().positive(),
        gameId: z.number().int().positive(),
        rating: z.null(),
        playtimeMinutes: z.literal(0),
        startedAt: z.null(),
        completedAt: z.null(),
        platforms: z.array(z.string()),
    });
