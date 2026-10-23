import { z } from "zod";

const STORAGE_KEY = "questlog:password-changed";
const noticeSchema = z
    .object({ email: z.email().optional(), expiresAt: z.number().positive() })
    .strict();

// Feedback de uso único para sobreviver ao redirecionamento da rota protegida.
// Este aviso não contém senha, código ou autorização.
export function storePasswordChangeNotice(email?: string) {
    try {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ email, expiresAt: Date.now() + 60_000 }),
        );
    } catch {
        // O estado de navegação ainda pode apresentar a confirmação.
    }
}

export function readPasswordChangeNotice() {
    try {
        const result = noticeSchema.safeParse(
            JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null"),
        );
        if (result.success && result.data.expiresAt > Date.now()) return result.data;
    } catch {
        // Um aviso indisponível não interfere na autenticação.
    }
    return null;
}

export function clearPasswordChangeNotice() {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // O aviso também tem um prazo curto para não reaparecer depois.
    }
}
