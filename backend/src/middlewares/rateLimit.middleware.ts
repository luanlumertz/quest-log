import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const useE2ELoginKeys =
    process.env.E2E_MODE === "true" &&
    process.env.NODE_ENV !== "production" &&
    process.env.DATABASE_URL !== undefined &&
    new URL(process.env.DATABASE_URL).pathname === "/quest_log_e2e";

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    // Cada teste tem seu contador; fora dos E2E, mantém a chave padrão por IP.
    ...(useE2ELoginKeys && {
        keyGenerator: (req: Request) => req.get("X-E2E-Test-ID") ?? ipKeyGenerator(req.ip!),
    }),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas de login. Tente novamente mais tarde.",
    },
});

export const refreshRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message:
            "Muitas solicitações de renovação de sessão. Aguarde alguns minutos e tente novamente.",
    },
});

export const registrationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas de cadastro. Tente novamente mais tarde.",
    },
});

export const verificationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas de verificação. Tente novamente mais tarde.",
    },
});

export const resendRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Muitas solicitações de reenvio. Tente novamente mais tarde.",
    },
});

// Solicitação e reenvio compartilham o contador para não permitir alternar as rotas.
export const passwordRecoveryRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Muitas solicitações de recuperação. Tente novamente mais tarde." },
});

export const passwordVerificationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Muitas tentativas de verificação. Tente novamente mais tarde." },
});

export const passwordResetRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Muitas tentativas de redefinição de senha. Tente novamente mais tarde." },
});

export const passwordChangeRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    keyGenerator: (req) => String(req.userId!),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Muitas tentativas de alteração de senha. Tente novamente mais tarde." },
});

export const passwordChangeIpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Muitas tentativas de alteração de senha. Tente novamente mais tarde." },
});

// Busca, detalhes e adição à biblioteca compartilham 250 chamadas por usuário em cinco minutos.
export const rawgRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 250,
    keyGenerator: (req) => String(req.userId!),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Muitas consultas em pouco tempo. Aguarde alguns minutos e tente novamente.",
    },
});
