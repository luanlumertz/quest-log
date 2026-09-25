export const API_URL = import.meta.env.VITE_API_URL;

const NO_REFRESH_ENDPOINTS = [
    "/auth/login",
    "/auth/logout",
    "/auth/register",
    "/auth/refresh"
];

export class ApiError extends Error {
    status: number;
    issues?: unknown[];

    constructor(message: string, status: number, issues?: unknown[]) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.issues = issues;
    }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}, canRetry = true) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const shouldTryRefresh = response.status === 401 && canRetry && !NO_REFRESH_ENDPOINTS.includes(endpoint);

    if (shouldTryRefresh) {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include"
        });

        if (refreshResponse.ok) {
            return apiRequest(endpoint, options, false);
        }

        window.dispatchEvent(new Event("auth:session-expired"));

        throw new ApiError("Sessão inválida", refreshResponse.status);
    }

    if (!response.ok) {
        let data;

        try {
            data = await response.json();
        } catch {
            throw new ApiError("Não foi possível processar a resposta do servidor", response.status);
        }

        const message = data.message ?? data.error ?? "Ocorreu um erro na requisição";

        throw new ApiError(message, response.status, data.issues);
    }

    return response;
}
