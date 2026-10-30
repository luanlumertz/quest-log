import type { Response } from "express";
import { ACCESS_TOKEN_EXPIRES_IN_MS, REFRESH_TOKEN_EXPIRES_IN_MS } from "../constants/auth.js";
import { getAppEnvironment } from "./appEnvironment.js";

const isSandbox = getAppEnvironment() === "sandbox";
const isProduction = process.env.NODE_ENV === "production";
const pathPrefix =
    process.env.AUTH_COOKIE_PATH_PREFIX ?? (isProduction && !isSandbox ? "/api" : "");

if (pathPrefix !== "" && pathPrefix !== "/api") {
    throw new Error("AUTH_COOKIE_PATH_PREFIX deve ser vazio ou /api.");
}

if (isSandbox && pathPrefix !== "") {
    throw new Error(
        "AUTH_COOKIE_PATH_PREFIX deve ser vazio no sandbox, pois a API usa caminhos diretos.",
    );
}

const accessPath = pathPrefix || "/";
const refreshPath = `${pathPrefix}/auth`;
const cookieOptions = { httpOnly: true, sameSite: "lax", secure: isProduction } as const;

function clearLegacyCookie(res: Response, name: string, path: string) {
    if (pathPrefix) {
        res.clearCookie(name, { ...cookieOptions, path });
    }
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
    clearLegacyCookie(res, "accessToken", "/");
    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: ACCESS_TOKEN_EXPIRES_IN_MS,
        path: accessPath,
    });
}

export function setRefreshTokenCookie(res: Response, refreshToken: string) {
    clearLegacyCookie(res, "refreshToken", "/auth");
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
        path: refreshPath,
    });
}

export function clearAccessTokenCookie(res: Response) {
    clearLegacyCookie(res, "accessToken", "/");
    res.clearCookie("accessToken", {
        ...cookieOptions,
        path: accessPath,
    });
}

export function clearRefreshTokenCookie(res: Response) {
    clearLegacyCookie(res, "refreshToken", "/auth");
    res.clearCookie("refreshToken", {
        ...cookieOptions,
        path: refreshPath,
    });
}
