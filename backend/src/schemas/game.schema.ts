import z from "zod";

export const searchGameSchema = z.object({
    query: z
        .string({
            error: "O termo de busca deve ser um texto"
        })
        .trim()
        .min(1, {
            error: "Informe um termo para busca"
        })
});

export const getRawgGameSchema = z.object({
    externalId: z
        .coerce
        .number({
            error: "Deve ser informado um id válido"
        })
        .int({
            error: "O id deve ser um número inteiro"
        })
});