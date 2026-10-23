import type { Request, Response } from "express";
import {
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "../lib/authCookies.js";
import type {
    ChangePasswordData,
    RequestPasswordRecoveryData,
    ResetPasswordData,
    VerifyPasswordRecoveryData,
} from "../schemas/auth.schema.js";
import {
    changePassword,
    requestPasswordRecovery,
    resetPassword,
    verifyPasswordRecovery,
} from "../services/password.service.js";

export function requestPasswordRecoveryController(
    req: Request<Record<string, string>, unknown, RequestPasswordRecoveryData>,
    res: Response,
) {
    return res.status(202).json(requestPasswordRecovery(req.body));
}

export async function verifyPasswordRecoveryController(
    req: Request<Record<string, string>, unknown, VerifyPasswordRecoveryData>,
    res: Response,
) {
    const result = await verifyPasswordRecovery(req.body);

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(result);
}

export async function resetPasswordController(
    req: Request<Record<string, string>, unknown, ResetPasswordData>,
    res: Response,
) {
    await resetPassword(req.body);

    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);

    return res.status(204).send();
}

export async function changePasswordController(
    req: Request<Record<string, string>, unknown, ChangePasswordData>,
    res: Response,
) {
    const result = await changePassword(req.userId!, req.body);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(204).send();
}
