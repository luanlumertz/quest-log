import { GameStatus } from "@prisma/client";
import z from "zod";

const platformSchema = z
    .string({
        error:
            "A plataforma deve ser um texto"
    })
    .trim()
    .min(1, {
        error: "A plataforma não pode estar vazia"
    });

export const addGameToLibrarySchema = z
    .object({
        externalId: z
            .number({
                error: "O externalId deve ser um número"
            })
            .int({
                error: "O externalId deve ser um número inteiro"
            }),

        status: z.enum(GameStatus, { error: "Status inválido" }),

        platforms: z
            .array(platformSchema, {
                error: "As plataformas devem ser enviadas em uma lista"
            })
            .min(1, {
                error: "Informe pelo menos uma plataforma"
            })
            .refine((platforms) => new Set(platforms).size === platforms.length, {
                error: "Não é permitido repetir plataformas"
            })
    })
    .strict();