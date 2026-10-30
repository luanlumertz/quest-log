import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
    clearedSessionCookieHeaders,
    csrfErrorResponse,
    csrfHeadersSchema,
    internalErrorResponse,
    messageResponse,
    sessionCookieHeaders,
    swaggerSessionInstructions,
} from "./auth.responses.js";

export function registerSessionPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/auth/refresh",
        operationId: "refreshAccessToken",
        tags: ["Autenticação"],
        summary: "Renovar a sessão",
        description: `Usa o cookie HttpOnly refreshToken; não exige accessToken válido nem corpo. Rotaciona o token de renovação, invalidando o anterior, e define novos cookies de acesso e renovação. A validade da renovação é reiniciada por mais sete dias. Retorna 204 sem JSON. ${swaggerSessionInstructions}`,
        security: [{ refreshCookieAuth: [] }],
        request: { headers: csrfHeadersSchema },
        responses: {
            204: {
                description: "Sessão renovada. Resposta sem corpo.",
                headers: sessionCookieHeaders,
            },
            401: messageResponse(
                "Cookie de renovação ausente, inválido, expirado, revogado ou já consumido.",
                "Sessão inválida",
            ),
            403: csrfErrorResponse,
            429: messageResponse(
                "Limite de 100 requisições por IP em cinco minutos.",
                "Muitas solicitações de renovação de sessão. Aguarde alguns minutos e tente novamente.",
            ),
            500: internalErrorResponse,
        },
    });

    registry.registerPath({
        method: "post",
        path: "/auth/logout",
        operationId: "logoutUser",
        tags: ["Autenticação"],
        summary: "Sair da sessão atual",
        description: `Revoga a sessão de renovação identificada pelo cookie refreshToken e limpa os cookies do navegador. Não exige accessToken válido nem corpo e retorna 204 mesmo sem cookie de renovação ou se a sessão já não existir. Não encerra as outras sessões da conta. A revogação é da sessão de renovação: uma cópia de um accessToken já emitido continua sujeita à sua validade. ${swaggerSessionInstructions}`,
        security: [],
        request: { headers: csrfHeadersSchema },
        responses: {
            204: {
                description:
                    "Cookies limpos e sessão de renovação revogada, quando existente. Sem corpo.",
                headers: clearedSessionCookieHeaders,
            },
            403: csrfErrorResponse,
            500: internalErrorResponse,
        },
    });
}
