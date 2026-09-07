import { GameStatus } from "@prisma/client";
import z from "zod";

const platformSchema = z
    .string({ error: "A plataforma deve ser um texto" })
    .trim()
    .min(1, { error: "A plataforma não pode estar vazia" });

export const addGameToLibrarySchema = z
    .object({
        externalId: z
            .number({ error: "O externalId deve ser um número" })
            .int({ error: "O externalId deve ser um número inteiro" }),

        status: z.enum(GameStatus, { error: "Status inválido" }),

        platforms: z
            .array(platformSchema, { error: "As plataformas devem ser enviadas em uma lista" })
            .min(1, { error: "Informe pelo menos uma plataforma" })
            .refine((platforms) => new Set(platforms).size === platforms.length, {
                error: "Não é permitido repetir plataformas"
            })
    })
    .strict();

export const getLibraryEntryDetailsSchema = z
    .object({
        gameId: z
            .coerce
            .number({ error: "O gameId deve ser um número" })
            .int({ error: "O gameId deve ser um número inteiro" })
            .positive({ error: "O gameId deve ser maior que 0" })
    })

export type GetLibraryEntryDetailsParams = z.infer<typeof getLibraryEntryDetailsSchema>;

export const updateLibraryEntrySchema = z
    .object({
        status: z
            .enum(GameStatus, { error: "Status inválido" })
            .optional(),

        rating: z
            .number({ error: "O rating deve ser um número" })
            .min(0, { error: "A nota deve ser no mínimo 0" })
            .max(5, { error: "A nota deve ser no máximo 5" })
            .multipleOf(0.1, { error: "A nota deve ter no máximo uma casa decimal" })
            .nullable()
            .optional(),

        playtimeMinutes: z
            .number({ error: "O playtimeMinutes deve ser um número" })
            .int({ error: "O playtimeMinutes deve ser um número inteiro" })
            .min(0, { error: "O playtimeMinutes deve ser no mínimo 0" })
            .optional(),

        platforms: z
            .array(
                z
                    .number({ error: "O id da plataforma deve ser um número" })
                    .int({ error: "O id da plataforma deve ser um número inteiro" })
                    .positive({ error: "O id da plataforma deve ser maior que 0" })
            )
            .min(1, { error: "Deve ser informada pelo menos uma plataforma" })
            .refine(
                platforms => new Set(platforms).size === platforms.length,
                { error: "As plataformas não podem se repetir" }
            )
            .optional(),

        startedAt: z
            .coerce
            .date({ error: "A data de início deve ser uma data válida" })
            .nullable()
            .optional(),

        completedAt: z
            .coerce
            .date({ error: "A data de conclusão deve ser uma data válida" })
            .nullable()
            .optional()
    })
    .strict()
    .refine(
        data => Object.values(data).some(value => value !== undefined),
        { error: "Pelo menos um campo deve ser informado para atualização" }
    )
