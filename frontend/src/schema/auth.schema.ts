import z from "zod";

export const registerSchema = z
    .object({
        name: z
            .string()
            .transform((name) => name.trim().replace(/\s+/g, " "))
            .pipe(
                z
                    .string()
                    .min(2, { error: "Nome deve ter pelo menos 2 caracteres" })
                    .max(64, { error: "Nome muito grande. Máximo: 64 caracteres" })
                    .regex(
                        /^[\p{L}\p{M}'’-]+(?: [\p{L}\p{M}'’-]+)*$/u,
                        { error: "Nome contém caracteres inválidos" }
                    )
            ),

        email: z
            .string()
            .trim()
            .toLowerCase()
            .pipe(z.email({ error: "Email inválido" })),

        password: z
            .string()
            .min(8, { error: "Senha deve ter pelo menos 8 caracteres" })
            .max(70, { error: "Senha muito grande. Máximo: 70 caracteres" })
            .refine((password) => password.trim().length > 0, {
                error: "A senha não pode conter apenas espaços"
            }),

        confirmPassword: z
            .string()
            .min(1, { error: "Confirme sua senha" }),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: "As senhas não coincidem",
            path: ["confirmPassword"],
        }
    )

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

export const updateSchema = z
    .object({
        name: z
            .string()
            .trim()
            .transform((name) => name.replace(/\s+/g, " "))
            .pipe(
                z.string()
                    .min(2, "Nome deve ter pelo menos 2 caracteres")
                    .max(64, "Nome muito grande. Máximo: 64 caracteres")
            )
    })
    .strict();

export type RegisterData = z.infer<typeof registerSchema>
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateData = z.infer<typeof updateSchema>
