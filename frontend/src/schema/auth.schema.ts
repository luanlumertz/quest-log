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

const passwordSchema = z
    .string()
    .min(8, { error: "Senha deve ter pelo menos 8 caracteres" })
    .max(70, { error: "Senha muito grande. Máximo: 70 caracteres" })
    .refine((password) => password.trim().length > 0, {
        error: "A senha não pode conter apenas espaços",
    });

export const registerSchema = z
    .object({
        name: nameSchema,

        email: emailSchema,

        password: passwordSchema,

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })
    .strict()
    .transform(({ confirmPassword, ...data }) => data);

export const loginSchema = z
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

export const updateSchema = z
    .object({
        name: nameSchema,
    })
    .strict();

export const verificationSchema = z
    .object({
        code: z.string().regex(/^\d{6}$/, { error: "Digite o código de seis dígitos" }),
    })
    .strict();

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

const newPasswordFields = {
    password: passwordSchema,
    confirmPassword: z.string(),
};

export const resetPasswordSchema = z
    .object(newPasswordFields)
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })
    .transform(({ confirmPassword, ...data }) => data);

export const changePasswordSchema = z
    .object({ currentPassword: loginSchema.shape.password, ...newPasswordFields })
    .strict()
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    })
    .refine((data) => data.password !== data.currentPassword, {
        message: "A nova senha deve ser diferente da senha atual.",
        path: ["password"],
    })
    .transform(({ confirmPassword, ...data }) => data);

export type ForgotPasswordData = z.output<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.input<typeof resetPasswordSchema>;
export type ResetPasswordData = z.output<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.input<typeof changePasswordSchema>;
export type ChangePasswordData = z.output<typeof changePasswordSchema>;
export type VerificationData = z.infer<typeof verificationSchema>;
export type RegisterFormData = z.input<typeof registerSchema>;
export type RegisterData = z.output<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateData = z.infer<typeof updateSchema>;
