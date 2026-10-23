import { z } from "zod";
import type { PendingRegistration } from "../types/auth.types";

const STORAGE_KEY = "questlog:pending-registration";

export const REGISTRATION_LIFETIME_MS = 30 * 60 * 1000;
export const REGISTRATION_RESEND_COOLDOWN_MS = 60 * 1000;
// Estes prazos orientam a interface. A validade real é sempre verificada pelo backend.

const pendingRegistrationSchema = z
    .object({
        pendingRegistrationId: z.uuid(),
        email: z.email(),
        expiresAt: z.number().positive(),
        resendAvailableAt: z.number().positive(),
    })
    .strict();

export function readPendingRegistration(): PendingRegistration | null {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const result = pendingRegistrationSchema.safeParse(JSON.parse(stored));
        if (result.success && result.data.expiresAt > Date.now()) {
            return result.data;
        }
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Se o armazenamento estiver indisponível, o fluxo ainda funciona em memória.
    }
    return null;
}

export function storePendingRegistration(pending: PendingRegistration | null) {
    try {
        if (pending) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
        } else {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // A senha e os dados do formulário nunca são persistidos aqui.
    }
}
