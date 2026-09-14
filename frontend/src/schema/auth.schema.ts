import z from "zod";

export const loginSchema = z
    .object({
        email: z
            .string()
            .trim()
            .toLowerCase()
            .pipe(z.email({ error: "Email inválido" })),
        password: z
            .string()
            .min(1, { error: "Senha é obrigatória" })
            .max(70, { error: "Senha inválida" })
    })