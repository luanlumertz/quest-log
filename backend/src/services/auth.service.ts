import {
    deleteUserById,
    findUserByEmail,
    findUserById,
    updateUserById,
} from "../repositories/user.repository.js";
import { comparePassword, hashPassword } from "../lib/bcrypt.js";
import { AppError } from "../errors/AppError.js";
import type { RegisterUserData, LoginUserData, UpdateUserData } from "../schemas/auth.schema.js";
import { generateToken } from "../lib/jwt.js";
import { createRefreshSessionForUser } from "./refreshSession.service.js";
import { generateVerificationCode, hashVerificationCode } from "../lib/verificationCode.js";
import { savePendingRegistration } from "../repositories/pendingRegistration.repository.js";
import {
    PENDING_REGISTRATION_EXPIRES_IN_MS,
    VERIFICATION_CODE_EXPIRES_IN_MS,
} from "../constants/auth.js";
import { sendEmail } from "../integrations/mail.js";

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

    await sendEmail({
        to: data.email,
        subject: "Código de verificação - QuestLog",
        text: `Seu código de verificação é ${code}. Ele é válido por 10 minutos.`,
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

    const accessToken = generateToken(user.id);

    const refreshToken = await createRefreshSessionForUser(user.id);

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
