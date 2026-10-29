import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export function registerSecuritySchemes(registry: OpenAPIRegistry) {
    registry.registerComponent("securitySchemes", "cookieAuth", {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description:
            "Cookie HttpOnly de acesso. Faça login no frontend local usando localhost no mesmo navegador antes de executar esta rota. O Swagger UI não preenche esse cookie manualmente nem renova a sessão automaticamente.",
    });
}
