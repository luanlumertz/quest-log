import request from "supertest";

import app from "../../../src/app.js";
import { csrfHeaders } from "../../helpers/http/csrf.helper.js";
import type {
    ChangePasswordData,
    RequestPasswordRecoveryData,
    ResetPasswordData,
    VerifyPasswordRecoveryData,
} from "../../../src/schemas/auth.schema.js";
import { waitForPasswordRecoveryEmails } from "../../../src/services/password.service.js";

import type { AppTestAgent } from "../../types/http.types.js";

export async function requestPasswordRecovery(payload: RequestPasswordRecoveryData) {
    const response = await request(app)
        .post("/auth/password/forgot")
        .set(csrfHeaders)
        .send(payload);

    await waitForPasswordRecoveryEmails();

    return response;
}

export async function resendPasswordRecoveryCode(payload: RequestPasswordRecoveryData) {
    const response = await request(app)
        .post("/auth/password/resend")
        .set(csrfHeaders)
        .send(payload);

    await waitForPasswordRecoveryEmails();

    return response;
}

export function verifyPasswordRecovery(payload: VerifyPasswordRecoveryData) {
    return request(app).post("/auth/password/verify").set(csrfHeaders).send(payload);
}

export function resetPassword(payload: ResetPasswordData) {
    return request(app).post("/auth/password/reset").set(csrfHeaders).send(payload);
}

export function changePassword(agent: AppTestAgent, payload: ChangePasswordData) {
    return agent.patch("/auth/me/password").set(csrfHeaders).send(payload);
}

export function changePasswordWithoutCookies(payload: ChangePasswordData) {
    return request(app).patch("/auth/me/password").set(csrfHeaders).send(payload);
}
