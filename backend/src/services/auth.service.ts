import { createUser, findUserByEmail, findUserById } from "../repositories/user.repository.js";
import { comparePassword, hashPassword } from "../lib/bcrypt.js";
import { AppError } from "../errors/AppError.js";
import type { LoginUserData, RegisterUserData } from "../types/auth.types.js";
import { generateToken } from "../lib/jwt.js";

export async function registerUser(data: RegisterUserData) {
    const existingUser = await findUserByEmail(data.email);

    if (existingUser) {
        throw new AppError("Este e-mail já está em uso", 409);
    }

    const passwordHash = await hashPassword(data.password)

    const user = await createUser({ name: data.name, email: data.email, passwordHash })

    return {
        id: user.id,
        name: user.name,
        email: user.email,
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

    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        token
    };
}

export async function getCurrentUser(id: number) {
    const user = await findUserById(id)

    if (!user) {
        throw new AppError("Usuário não encontrado", 404);
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email
    }
}
