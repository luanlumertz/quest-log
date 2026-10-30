import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export function registerSecuritySchemes(registry: OpenAPIRegistry) {
    registry.registerComponent("securitySchemes", "refreshCookieAuth", {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description:
            "Cookie HttpOnly de renovação recebido no login. Pelo proxy /api local, configure AUTH_COOKIE_PATH_PREFIX=/api e faça login novamente. O navegador envia o cookie; não preencha Authorize manualmente.",
    });

    registry.registerComponent("securitySchemes", "cookieAuth", {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description:
            "Cookie HttpOnly de acesso. Faça login pelo POST /auth/login no Swagger usando localhost:5173/api/docs/ e o servidor /api, ou pelo frontend local no mesmo navegador. O navegador gerencia o cookie; não é necessário preencher Authorize. O Swagger UI não renova a sessão automaticamente.",
    });
}
