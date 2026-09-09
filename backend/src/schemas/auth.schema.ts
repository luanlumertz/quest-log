import { z } from "zod"

export const registerUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Nome deve ter pelo menos 2 caracteres" })
      .max(64, { error: "Nome muito grande. Máximo: 64 caracteres" }),

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

    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    }
  )
  .transform(({ confirmPassword, ...data }) => data);

export const loginUserSchema = z
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

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Nome deve ter pelo menos 2 caracteres" })
      .max(64, { error: "Nome muito grande. Máximo: 64 caracteres" }),
  })
  .strict()
