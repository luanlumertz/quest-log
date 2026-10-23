import { z } from "zod";
import type { PasswordRecovery } from "../types/auth.types";

const STORAGE_KEY = "questlog:password-recovery";

export const PASSWORD_RECOVERY_RESEND_COOLDOWN_MS = 60 * 1000;

const passwordRecoverySchema = z
    .object({
        email: z.email(),
        resendAvailableAt: z.number().positive(),
    })
    .strict();

export function readPasswordRecovery(): PasswordRecovery | null {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const result = passwordRecoverySchema.safeParse(JSON.parse(stored));
        if (result.success) return result.data;

        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // O fluxo continua disponível em memória se o armazenamento estiver bloqueado.
    }

    return null;
}

export function storePasswordRecovery(recovery: PasswordRecovery | null) {
    try {
        if (recovery) {
            // Nunca persistir o código, as senhas ou a autorização de redefinição.
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    email: recovery.email,
                    resendAvailableAt: recovery.resendAvailableAt,
                }),
            );
        } else {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Os prazos locais orientam a interface; o backend continua validando tudo.
    }
}
