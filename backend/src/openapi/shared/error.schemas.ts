import z from "zod";

export const messageResponseSchema = z.object({ message: z.string() });

export const validationErrorResponseSchema = z.object({
    error: z.literal("Erro de Validação"),
    issues: z.array(
        z.looseObject({
            code: z.string(),
            path: z.array(z.union([z.string(), z.number()])),
            message: z.string(),
        }),
    ),
});
