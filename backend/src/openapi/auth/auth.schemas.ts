import z from "zod";
import {
    changePasswordSchema,
    loginUserSchema,
    registerUserSchema,
    requestPasswordRecoverySchema,
    resetPasswordSchema,
    updateUserSchema,
    verifyPasswordRecoverySchema,
} from "../../schemas/auth.schema.js";

export const loginRequestSchema = loginUserSchema.extend({
    email: loginUserSchema.shape.email.meta({
        description:
            "E-mail da conta. Espaços nas extremidades são removidos e letras são convertidas para minúsculas.",
        format: "email",
        example: "jogador@example.com",
    }),
    password: loginUserSchema.shape.password.meta({
        description:
            "Senha da conta, de 1 a 70 caracteres. Não pode conter apenas espaços e não é normalizada.",
        format: "password",
        writeOnly: true,
    }),
});

export const userResponseSchema = z.object({
    id: z.number().int().positive(),
    name: z.string(),
    email: z.email(),
});

const displayNameSchema = updateUserSchema.shape.name.meta({
    type: "string",
    description:
        "Nome de exibição normalizado: espaços externos removidos e espaços consecutivos reduzidos a um. Deve ter de 2 a 64 caracteres após normalização, conter letra ou número e usar somente letras, números, espaços, hífens, apóstrofos e sublinhados.",
    example: "Jogador",
});

const newPasswordSchema = registerUserSchema.shape.password.meta({
    format: "password",
    writeOnly: true,
    description:
        "Nova senha: de 8 a 70 caracteres, no máximo 72 bytes em UTF-8, sem conter apenas espaços. Não é normalizada. Acentos e emojis podem ocupar mais de um byte.",
});

export const registerRequestSchema = registerUserSchema.extend({
    name: displayNameSchema,
    email: loginRequestSchema.shape.email,
    password: newPasswordSchema,
});

export const updateUserRequestSchema = updateUserSchema.extend({ name: displayNameSchema });

export const requestPasswordRecoveryRequestSchema = requestPasswordRecoverySchema.extend({
    email: loginRequestSchema.shape.email,
});

export const verifyPasswordRecoveryRequestSchema = verifyPasswordRecoverySchema.extend({
    email: loginRequestSchema.shape.email,
});

export const resetPasswordRequestSchema = resetPasswordSchema.extend({
    password: newPasswordSchema,
    resetToken: resetPasswordSchema.shape.resetToken.meta({
        writeOnly: true,
        description:
            "Autorização de uso único retornada por /auth/password/verify: 64 caracteres hexadecimais minúsculos.",
    }),
});

export const changePasswordRequestSchema = changePasswordSchema.extend({
    currentPassword: loginRequestSchema.shape.password,
    password: newPasswordSchema,
});
