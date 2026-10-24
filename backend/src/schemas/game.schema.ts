import z from "zod";

export const searchGameSchema = z.object({
    page: z
        .union([z.string(), z.number()], { error: "Informe uma página válida" })
        .pipe(
            z.coerce
                .number<string | number>({ error: "Informe uma página válida" })
                .int({ error: "A página deve ser um número inteiro" })
                .positive({ error: "A página deve ser maior que zero" }),
        )
        .default(1),
    query: z
        .string({ error: "O termo de busca deve ser um texto" })
        .trim()
        .min(1, { error: "Informe um termo para busca" }),
});

export const getRawgGameSchema = z.object({
    externalId: z.coerce
        .number({ error: "Deve ser informado um id válido" })
        .int({ error: "O id deve ser um número inteiro" })
        .positive({ error: "O id deve ser um número positivo" }),
});

export type SearchGameQuery = z.output<typeof searchGameSchema>;
export type GetRawgGameParams = z.output<typeof getRawgGameSchema>;
