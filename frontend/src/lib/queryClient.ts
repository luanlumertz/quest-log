import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../services/api";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,

            retry: (failureCount, error) => {
                if (error instanceof ApiError) {
                    const isClientError = error.status >= 400 && error.status < 500;

                    const canBeTransient = error.status === 408 || error.status === 429;

                    if (isClientError && !canBeTransient) {
                        return false;
                    }
                }

                return failureCount < 1;
            }
        }
    }
});
