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

export const registerUserSchema = z
    .object({
        name: nameSchema,

        email: emailSchema,

        password: passwordSchema,
    })
    .strict();

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

export const verifyRegistrationSchema = z
    .object({
        pendingRegistrationId: z.uuid(),

        code: z.string().regex(/^\d{6}$/, { error: "O código deve conter 6 dígitos" }),
    })
    .strict();

export const resendRegistrationCodeSchema = z
    .object({
        pendingRegistrationId: z.uuid(),
    })
    .strict();

export const requestPasswordRecoverySchema = z
    .object({
        email: emailSchema,
    })
    .strict();

export const verifyPasswordRecoverySchema = z
    .object({
        email: emailSchema,

        code: z.string().regex(/^\d{6}$/, { error: "O código deve conter 6 dígitos" }),
    })
    .strict();

export const resetPasswordSchema = z
    .object({
        resetToken: z.string().regex(/^[a-f0-9]{64}$/, { error: "Autorização inválida" }),

        password: passwordSchema,
    })
    .strict();

export const changePasswordSchema = z
    .object({
        currentPassword: loginUserSchema.shape.password,

        password: passwordSchema,
    })
    .strict();

export type ResendRegistrationCodeData = z.output<typeof resendRegistrationCodeSchema>;
export type VerifyRegistrationData = z.output<typeof verifyRegistrationSchema>;
export type RegisterUserPayload = z.input<typeof registerUserSchema>;
export type RegisterUserData = z.output<typeof registerUserSchema>;
export type LoginUserPayload = z.input<typeof loginUserSchema>;
export type LoginUserData = z.output<typeof loginUserSchema>;
export type UpdateUserPayload = z.input<typeof updateUserSchema>;
export type UpdateUserData = z.output<typeof updateUserSchema>;
export type RequestPasswordRecoveryData = z.output<typeof requestPasswordRecoverySchema>;
export type VerifyPasswordRecoveryData = z.output<typeof verifyPasswordRecoverySchema>;
export type ResetPasswordData = z.output<typeof resetPasswordSchema>;
export type ChangePasswordData = z.output<typeof changePasswordSchema>;
