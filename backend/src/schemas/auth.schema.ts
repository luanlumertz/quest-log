import { z } from "zod";

const nameSchema = z
    .string()
    .trim()
    .transform((name) => name.replace(/\s+/g, " "))
    .pipe(
        z
            .string()
            .min(2, { error: "Nome deve ter pelo menos 2 caracteres" })
            .max(64, { error: "Nome muito grande. Máximo: 64 caracteres" })
            .regex(/^[\p{L}\p{M}'’-]+(?: [\p{L}\p{M}'’-]+)*$/u, {
                error: "Nome contém caracteres inválidos",
            }),
    );

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Email inválido" }));

export const registerUserSchema = z
    .object({
        name: nameSchema,

        email: emailSchema,

        password: z
            .string()
            .min(8, { error: "Senha deve ter pelo menos 8 caracteres" })
            .max(70, { error: "Senha muito grande. Máximo: 70 caracteres" })
            .refine((password) => password.trim().length > 0, {
                error: "A senha não pode conter apenas espaços",
            }),

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })
    .strict()
    .transform(({ confirmPassword, ...data }) => data);

export const loginUserSchema = z
    .object({
        email: emailSchema,

        password: z
            .string()
            .min(1, { error: "Senha é obrigatória" })
            .max(70, { error: "Senha inválida" })
            .refine((password) => password.trim().length > 0, {
                error: "Senha é obrigatória",
            }),
    })
    .strict();

export const updateUserSchema = z
    .object({
        name: nameSchema,
    })
    .strict();

export type RegisterUserPayload = z.input<typeof registerUserSchema>;
export type RegisterUserData = z.output<typeof registerUserSchema>;
export type LoginUserPayload = z.input<typeof loginUserSchema>;
export type UpdateUserPayload = z.input<typeof updateUserSchema>;
