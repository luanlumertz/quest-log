import { z } from "zod"

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(64, "Nome muito grande. Máximo: 64 caracteres"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Email inválido")),

    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .max(70, "Senha muito grande. Máximo: 70 caracteres")
      .refine(
        (password) => password.trim().length > 0,
        "A senha não pode conter apenas espaços"
      ),

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