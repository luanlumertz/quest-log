import { z } from "zod";

const namedItemSchema = z.object({
    name: z.string(),
});

const platformSchema = z.object({
    platform: namedItemSchema,
});

export const rawgGameSchema = z.object({
    id: z.number(),
    name: z.string(),
    background_image: z.string().nullish().default(null),
    released: z.string().nullish().default(null),
    platforms: z.array(platformSchema).nullish().default([]),
});

export const rawgSearchResponseSchema = z.object({
    next: z.url().nullable(),
    previous: z.url().nullable(),
    results: z.array(rawgGameSchema),
});

export const rawgDetailsSchema = rawgGameSchema.extend({
    description_raw: z.string().nullish().default(""),
    genres: z.array(namedItemSchema).nullish().default([]),
    developers: z.array(namedItemSchema).nullish().default([]),
    publishers: z.array(namedItemSchema).nullish().default([]),
});

export type RawgGame = z.infer<typeof rawgGameSchema>;
export type RawgGameDetails = z.infer<typeof rawgDetailsSchema>;
