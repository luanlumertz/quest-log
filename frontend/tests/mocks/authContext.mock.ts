import { vi } from "vitest";
import type { AuthContextType } from "../../src/contexts/AuthContext";

export function createAuthContextMock(overrides: Partial<AuthContextType> = {}): AuthContextType {
    return {
        user: null,
        status: "unauthenticated",
        setUser: vi.fn(),
        retryAuth: vi.fn(async () => {}),
        signOut: vi.fn(async () => {}),
        ...overrides,
    };
}
