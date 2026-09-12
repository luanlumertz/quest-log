export const API_URL = import.meta.env.VITE_API_URL;

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

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!response.ok) {
        let data;

        try {
            data = await response.json();
        } catch {
            throw new ApiError("Não foi possível processar a resposta do servidor", response.status);
        }

        const message = data.message ?? data.error ?? "Ocorreu um erro na requisição";

        throw new ApiError(message, response.status, data.issues
        );
    }

    return response;
}
