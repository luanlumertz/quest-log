import { createUser, findUserByEmail } from "../repositories/user.repository.js";
import type { RegisterUserData } from "../types/RegisterUserData.js";
import { hashPassword } from "../lib/bcrypt.js";
import { AppError } from "../errors/AppError.js";

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
