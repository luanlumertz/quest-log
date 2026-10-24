import {
    deleteUserById,
    findUserByEmail,
    findUserById,
    updateUserById,
} from "../repositories/user.repository.js";
import { comparePassword, hashPassword } from "../lib/bcrypt.js";
import { AppError } from "../errors/AppError.js";
import type {
    RegisterUserData,
    LoginUserData,
    UpdateUserData,
    VerifyRegistrationData,
    ResendRegistrationCodeData,
} from "../schemas/auth.schema.js";
import { generateToken } from "../lib/jwt.js";
import { createRefreshSessionForUser } from "./refreshSession.service.js";
import {
    generateVerificationCode,
    hashVerificationCode,
    verifyVerificationCode,
} from "../lib/verificationCode.js";
import {
    completePendingRegistration,
    findPendingRegistrationById,
    incrementVerificationAttempts,
    savePendingRegistration,
    updatePendingRegistrationCode,
} from "../repositories/pendingRegistration.repository.js";
import {
    MAX_VERIFICATION_ATTEMPTS,
    PENDING_REGISTRATION_EXPIRES_IN_MS,
    VERIFICATION_CODE_EXPIRES_IN_MS,
    VERIFICATION_RESEND_COOLDOWN_MS,
} from "../constants/auth.js";
import { sendRegistrationVerificationEmail } from "./auth.helpers.js";
import { Prisma } from "../generated/prisma/client.js";

export async function registerUser(data: RegisterUserData) {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser) {
        throw new AppError("Este e-mail já está em uso", 409);
    }

    const code = generateVerificationCode();

    const passwordHash = await hashPassword(data.password);
    const codeHash = await hashVerificationCode(code);

    const now = Date.now();

    const pendingRegistration = await savePendingRegistration({
        name: data.name,
        email: data.email,
        passwordHash,
        codeHash,
        codeExpiresAt: new Date(now + VERIFICATION_CODE_EXPIRES_IN_MS),
        expiresAt: new Date(now + PENDING_REGISTRATION_EXPIRES_IN_MS),
    });

    await sendRegistrationVerificationEmail({
        pendingRegistrationId: pendingRegistration.id,
        codeHash,
        to: data.email,
        code,
        subject: "Código de verificação - QuestLog",
        text: `Seu código de verificação é ${code}. Ele é válido por 10 minutos.`,
        logMessage: "Erro ao enviar e-mail de cadastro:",
        errorMessage: "Não foi possível enviar o código de verificação. Tente novamente.",
    });

    return {
        pendingRegistrationId: pendingRegistration.id,
        email: pendingRegistration.email,
    };
}

export async function loginUser(data: LoginUserData) {
    const user = await findUserByEmail(data.email);

    if (!user) {
        throw new AppError("Email ou senha inválidos", 401);
    }

    const isPasswordCorrect = await comparePassword(data.password, user.passwordHash);

    if (!isPasswordCorrect) {
        throw new AppError("Email ou senha inválidos", 401);
    }

    const accessToken = generateToken(user.id, user.sessionVersion);

    const refreshToken = await createRefreshSessionForUser(user.id, user.sessionVersion);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
}

export async function getCurrentUser(id: number) {
    const user = await findUserById(id);

    if (!user) {
        throw new AppError("Usuário não encontrado", 404);
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}

export async function updateUser(id: number, data: UpdateUserData) {
    const updatedUser = await updateUserById(id, data);

    return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
    };
}

export async function deleteUser(id: number) {
    await deleteUserById(id);
}

export async function verifyRegistration(data: VerifyRegistrationData) {
    const pending = await findPendingRegistrationById(data.pendingRegistrationId);

    if (!pending) {
        throw new AppError("Código inválido ou expirado.", 400);
    }

    const now = new Date();

    if (pending.expiresAt <= now || pending.codeExpiresAt <= now) {
        throw new AppError("Código inválido ou expirado.", 400);
    }

    if (pending.attempts >= MAX_VERIFICATION_ATTEMPTS) {
        throw new AppError("Limite de tentativas excedido.", 429);
    }

    const isValid = await verifyVerificationCode(data.code, pending.codeHash);

    if (!isValid) {
        await incrementVerificationAttempts(pending.id, pending.codeHash);

        throw new AppError("Código inválido.", 400);
    }

    try {
        const user = await completePendingRegistration(pending);

        if (!user) {
            throw new AppError("Código inválido ou expirado.", 400);
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new AppError("Este e-mail já está em uso", 409);
        }

        throw error;
    }
}

export async function resendRegistrationCode(data: ResendRegistrationCodeData) {
    const pending = await findPendingRegistrationById(data.pendingRegistrationId);

    if (!pending || pending.expiresAt <= new Date()) {
        throw new AppError("Cadastro expirado ou não encontrado.", 400);
    }

    const now = Date.now();

    if (now - pending.lastCodeSentAt.getTime() < VERIFICATION_RESEND_COOLDOWN_MS) {
        throw new AppError("Aguarde 60 segundos antes de reenviar o código.", 429);
    }

    const code = generateVerificationCode();
    const codeHash = await hashVerificationCode(code);

    const codeExpiresAt = new Date(
        Math.min(now + VERIFICATION_CODE_EXPIRES_IN_MS, pending.expiresAt.getTime()),
    );

    const updated = await updatePendingRegistrationCode(pending.id, codeHash, codeExpiresAt);

    if (updated.count !== 1) {
        throw new AppError("Não foi possível reenviar o código neste momento.", 429);
    }

    await sendRegistrationVerificationEmail({
        pendingRegistrationId: pending.id,
        codeHash,
        to: pending.email,
        code,
        validity: "Válido por até 10 minutos, respeitando o prazo do cadastro",
        subject: "Novo código de verificação - QuestLog",
        text: `Seu novo código de verificação é ${code}. Ele é válido por até 10 minutos, respeitando o prazo do cadastro.`,
        logMessage: "Erro ao reenviar código de verificação:",
        errorMessage: "Não foi possível reenviar o código. Tente novamente.",
    });

    return {
        message: "Novo código de verificação enviado.",
    };
}
