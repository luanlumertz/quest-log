import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import {
    clearedSessionCookieHeaders,
    csrfErrorResponse,
    csrfHeadersSchema,
    internalErrorResponse,
    jsonErrorResponses,
    messageResponse,
    swaggerSessionInstructions,
    unauthenticatedResponse,
    validationErrorResponse,
} from "./auth.responses.js";
import { updateUserRequestSchema, userResponseSchema } from "./auth.schemas.js";

export function registerProfilePaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "patch",
        path: "/auth/me",
        operationId: "updateCurrentUser",
        tags: ["Perfil"],
        summary: "Atualizar nome de exibição",
        description: `Altera somente o nome de exibição da conta autenticada. Não altera e-mail ou senha. O nome é normalizado e validado conforme o schema. ${swaggerSessionInstructions}`,
        security: [{ cookieAuth: [] }],
        request: {
            headers: csrfHeadersSchema,
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: updateUserRequestSchema,
                        example: { name: "Jogador" },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Dados públicos atualizados.",
                content: {
                    "application/json": {
                        schema: z.object({ user: userResponseSchema }),
                        example: { user: { id: 1, name: "Jogador", email: "jogador@example.com" } },
                    },
                },
            },
            ...jsonErrorResponses,
            401: unauthenticatedResponse,
            403: csrfErrorResponse,
            404: messageResponse(
                "Conta removida entre autenticação e atualização.",
                "Registro não encontrado",
            ),
            422: validationErrorResponse,
            500: internalErrorResponse,
        },
    });

    registry.registerPath({
        method: "delete",
        path: "/auth/me",
        operationId: "deleteCurrentUser",
        tags: ["Perfil"],
        summary: "Excluir a conta autenticada",
        description: `Exclui a conta, sua biblioteca, as sessões de renovação e os dados de recuperação vinculados por exclusão em cascata. Preserva os jogos e plataformas do catálogo compartilhado. Limpa os cookies do navegador e retorna 204 sem corpo. Não recebe corpo ou confirmação de senha. ${swaggerSessionInstructions}`,
        security: [{ cookieAuth: [] }],
        request: { headers: csrfHeadersSchema },
        responses: {
            204: {
                description: "Conta excluída e cookies limpos. Sem corpo.",
                headers: clearedSessionCookieHeaders,
            },
            401: unauthenticatedResponse,
            403: csrfErrorResponse,
            404: messageResponse(
                "Conta removida entre autenticação e exclusão.",
                "Registro não encontrado",
            ),
            500: internalErrorResponse,
        },
    });
}
