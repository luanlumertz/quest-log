import { ApiError, NetworkError } from "../services/api";

export function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof NetworkError) {
        return error.message;
    }

    if (error instanceof ApiError) {
        if (error.status >= 400 && error.status < 500) {
            return error.message;
        }

        return fallback;
    }

    return fallback;
}
