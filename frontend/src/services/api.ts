export const API_URL = import.meta.env.VITE_API_URL;

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

const NO_REFRESH_ENDPOINTS = [
    "/auth/login",
    "/auth/logout",
    "/auth/register",
    "/auth/refresh"
];

const INVALID_REFRESH_STATUSES = [400, 401, 403];

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

export class NetworkError extends Error {
    constructor() {
        super("Não foi possível conectar ao servidor.");

        this.name = "NetworkError";
    }
}

type RefreshResult = "refreshed" | "expired";

let refreshPromise: Promise<RefreshResult> | null = null;

function isNoRefreshEndpoint(endpoint: string) {
    return NO_REFRESH_ENDPOINTS.some((path) => endpoint === path || endpoint.startsWith(`${path}?`));
}

async function fetchWithNetworkHandling(url: string, options: RequestInit) {
    try {
        return await fetch(url, options);
    } catch {
        throw new NetworkError();
    }
}

async function tryRefreshSession(): Promise<RefreshResult> {
    if (!refreshPromise) {
        refreshPromise = fetchWithNetworkHandling(`${API_URL}/auth/refresh`,
            {
                method: "POST",
                credentials: "include"
            }
        )
            .then((response) => {
                if (response.ok) {
                    return "refreshed" as const;
                }

                if (INVALID_REFRESH_STATUSES.includes(response.status)
                ) {
                    return "expired" as const;
                }

                throw new ApiError("Não foi possível renovar a sessão.", response.status);
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

function expireSession() {
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

async function createApiError(response: Response): Promise<ApiError> {
    try {
        const data = await response.json();

        const message = data.message ?? data.error ?? "Ocorreu um erro na requisição.";

        return new ApiError(message, response.status, data.issues);
    } catch {
        return new ApiError("Não foi possível processar a resposta do servidor.", response.status);
    }
}

function createRequestHeaders(options: RequestInit) {
    const headers = new Headers(options.headers);

    const hasJsonBody = typeof options.body === "string";

    if (hasJsonBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return headers;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}, canRetry = true) {
    const headers = createRequestHeaders(options);

    const response = await fetchWithNetworkHandling(`${API_URL}${endpoint}`,
        {
            ...options,
            credentials: "include",
            headers
        }
    );

    const isProtectedUnauthorized = response.status === 401 && !isNoRefreshEndpoint(endpoint);

    if (isProtectedUnauthorized) {
        if (canRetry) {
            const refreshResult = await tryRefreshSession();

            if (refreshResult === "refreshed") {
                return apiRequest(endpoint, options, false);
            }
        }

        expireSession();

        throw new ApiError("Sessão inválida.", 401);
    }

    if (!response.ok) {
        throw await createApiError(response);
    }

    return response;
}
