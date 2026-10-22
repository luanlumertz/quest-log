import { rateLimit } from "express-rate-limit";

export const registrationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Muitas tentativas de cadastro. Tente novamente mais tarde.",
    },
});
