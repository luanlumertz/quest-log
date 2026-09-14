import type { LoginData, RegisterData } from "../schema/auth.schema";
import type { AuthResponse, User } from "../types/auth.types";
import { apiRequest } from "./api";

export async function login(data: LoginData): Promise<User> {
    const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: data.email,
            password: data.password
        })
    });

    const result: AuthResponse = await response.json();

    return result.user;
}

export async function register(data: RegisterData): Promise<User> {
    const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword
        })
    });

    const result: AuthResponse = await response.json();

    return result.user;
}

export async function getCurrentUser(): Promise<User> {
    const response = await apiRequest("/auth/me")

    const result: AuthResponse = await response.json();

    return result.user;
}
