import type { RegisterUserPayload } from "../../src/schemas/auth.schema.js";
import { prisma } from "../../src/lib/prisma.js";

import { createRegisteredUser } from "./auth.fixture.js";
import { getLastVerificationCode } from "../helpers/http/verificationCode.helper.js";
import {
    requestPasswordRecovery,
    verifyPasswordRecovery,
} from "../requests/auth/password.request.js";

export async function createPasswordRecovery(overrides: Partial<RegisterUserPayload> = {}) {
    const { user, payload } = await createRegisteredUser(overrides);
    const response = await requestPasswordRecovery({ email: payload.email });

    if (response.status !== 202) {
        throw new Error(`Falha ao preparar recuperação. Status recebido: ${response.status}`);
    }

    const recovery = await prisma.passwordRecovery.findUniqueOrThrow({
        where: { userId: user.id },
    });

    return { user, payload, recovery, code: getLastVerificationCode() };
}

export async function createAuthorizedPasswordReset(overrides: Partial<RegisterUserPayload> = {}) {
    const recovery = await createPasswordRecovery(overrides);
    const response = await verifyPasswordRecovery({
        email: recovery.payload.email,
        code: recovery.code,
    });

    if (response.status !== 200 || typeof response.body.resetToken !== "string") {
        throw new Error(`Falha ao autorizar redefinição. Status recebido: ${response.status}`);
    }

    const resetToken: string = response.body.resetToken;

    return { ...recovery, resetToken };
}
