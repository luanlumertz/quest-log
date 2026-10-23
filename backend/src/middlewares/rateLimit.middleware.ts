import { rateLimit } from "express-rate-limit";

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas de login. Tente novamente mais tarde.",
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
