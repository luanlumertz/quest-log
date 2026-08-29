import { createUser, findUserByEmail } from "../repositories/user.repository.js";
import { comparePassword, hashPassword } from "../lib/bcrypt.js";
import { AppError } from "../errors/AppError.js";
import type { LoginUserData, RegisterUserData } from "../types/auth.types.js";

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

    if(!isPasswordCorrect){
        throw new AppError("Email ou senha inválidos", 401);
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}
