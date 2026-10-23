import type { LoginData, RegisterData, UpdateData, VerificationData } from "../schema/auth.schema";
import type { AuthResponse, RegistrationResponse, User } from "../types/auth.types";
import { apiRequest } from "./api";

export async function login(data: LoginData): Promise<User> {
    const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: data.email,
            password: data.password,
        }),
    });

    const result: AuthResponse = await response.json();

    return result.user;
}

export async function register(data: RegisterData): Promise<RegistrationResponse> {
    const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });

    return response.json();
}

export async function verifyRegistration(
    pendingRegistrationId: string,
    data: VerificationData,
): Promise<User> {
    const response = await apiRequest("/auth/register/verify", {
        method: "POST",
        body: JSON.stringify({ pendingRegistrationId, code: data.code }),
    });

    const result: AuthResponse = await response.json();

    return result.user;
}

export async function resendRegistrationCode(pendingRegistrationId: string): Promise<void> {
    await apiRequest("/auth/register/resend", {
        method: "POST",
        body: JSON.stringify({ pendingRegistrationId }),
    });
}

export async function logout() {
    await apiRequest("/auth/logout", {
        method: "POST",
    });
}

export async function getCurrentUser(): Promise<User> {
    const response = await apiRequest("/auth/me");

    const result: AuthResponse = await response.json();

    return result.user;
}

export async function updateCurrentUser(data: UpdateData): Promise<User> {
    const response = await apiRequest("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
            name: data.name,
        }),
    });

    const result: AuthResponse = await response.json();

    return result.user;
}

export async function deleteCurrentUser(): Promise<void> {
    await apiRequest("/auth/me", {
        method: "DELETE",
    });
}
