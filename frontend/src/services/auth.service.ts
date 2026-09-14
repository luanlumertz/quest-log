import type { LoginData, User } from "../types/auth.types";
import { apiRequest } from "./api";

export async function login(data: LoginData): Promise<User> {
    const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: data.email,
            password: data.password
        })
    });

    return response.json();
}
