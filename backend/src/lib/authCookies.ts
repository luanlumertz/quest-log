import type { Response } from "express";
import { ACCESS_TOKEN_EXPIRES_IN_MS, REFRESH_TOKEN_EXPIRES_IN_MS } from "../constants/auth.js";

const isProduction = process.env.NODE_ENV === "production";

export function setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: ACCESS_TOKEN_EXPIRES_IN_MS,
        path: "/"
    });
}

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
        path: "/auth"
    });
}

export function clearAccessTokenCookie(res: Response) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        path: "/"
    });
}

export function clearRefreshTokenCookie(res: Response) {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        path: "/auth"
    });
}
