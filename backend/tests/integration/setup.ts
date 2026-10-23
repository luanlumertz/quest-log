import { beforeEach, afterEach } from "vitest";
import { ipKeyGenerator } from "express-rate-limit";

import { prisma } from "../../src/lib/prisma.js";
import {
    loginRateLimiter,
    refreshRateLimiter,
    registrationRateLimiter,
    verificationRateLimiter,
    resendRateLimiter,
    passwordRecoveryRateLimiter,
    passwordVerificationRateLimiter,
    passwordResetRateLimiter,
    passwordChangeIpRateLimiter,
    passwordChangeRateLimiter,
    rawgRateLimiter,
} from "../../src/middlewares/rateLimit.middleware.js";
import { waitForPasswordRecoveryEmails } from "../../src/services/password.service.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("Testes interrompidos: DATABASE_URL não definida.");
}

const url = new URL(databaseUrl);

const databaseName = url.pathname.slice(1);
const allowedHosts = ["localhost", "127.0.0.1", "[::1]"];

if (databaseName !== "quest_log_test" || !allowedHosts.includes(url.hostname)) {
    throw new Error(
        "Testes interrompidos: DATABASE_URL deve apontar para o banco local quest_log_test.",
    );
}

beforeEach(async () => {
    await waitForPasswordRecoveryEmails();

    // Cada teste começa com contadores vazios; o bloqueio continua ativo dentro dele.
    for (const limiter of [
        loginRateLimiter,
        refreshRateLimiter,
        registrationRateLimiter,
        verificationRateLimiter,
        resendRateLimiter,
        passwordRecoveryRateLimiter,
        passwordVerificationRateLimiter,
        passwordResetRateLimiter,
        passwordChangeIpRateLimiter,
    ]) {
        for (const ip of ["127.0.0.1", "::ffff:127.0.0.1", "::1"]) {
            limiter.resetKey(ipKeyGenerator(ip));
        }
    }

    const users = await prisma.user.findMany({ select: { id: true } });

    for (const user of users) {
        passwordChangeRateLimiter.resetKey(String(user.id));
        rawgRateLimiter.resetKey(String(user.id));
    }

    await prisma.passwordRecovery.deleteMany();
    await prisma.pendingRegistration.deleteMany();
    await prisma.libraryEntryPlatform.deleteMany();
    await prisma.libraryEntry.deleteMany();
    await prisma.gamePlatform.deleteMany();
    await prisma.refreshSession.deleteMany();

    await prisma.game.deleteMany();
    await prisma.platform.deleteMany();
    await prisma.user.deleteMany();
});

afterEach(async () => {
    await waitForPasswordRecoveryEmails();
});
