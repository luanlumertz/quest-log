import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import { messageResponseSchema, validationErrorResponseSchema } from "../shared/error.schemas.js";

export function messageResponse(description: string, message: string): ResponseConfig {
    return {
        description,
        content: { "application/json": { schema: messageResponseSchema, example: { message } } },
    };
}

export const csrfHeadersSchema = z.object({
    "X-QuestLog-Request": z.literal("true").meta({
        description: "Cabeçalho obrigatório da proteção CSRF.",
        example: "true",
    }),
});

export const csrfErrorResponse: ResponseConfig = {
    description: "Origem ou cabeçalho CSRF inválido, ou acesso rejeitado pela proteção de origem.",
    content: {
        "application/json": {
            schema: messageResponseSchema,
            examples: {
                csrf: { value: { message: "Origem da requisição não permitida." } },
                origin: { value: { message: "Acesso à API não permitido." } },
            },
        },
    },
};

export const jsonErrorResponses = {
    400: messageResponse("JSON malformado.", "JSON malformado"),
    415: messageResponse("Corpo deve ser JSON.", "O corpo da requisição deve ser enviado em JSON."),
};

export const validationErrorResponse: ResponseConfig = {
    description:
        "Corpo inválido ou campos desconhecidos. Consulte issues para identificar os campos.",
    content: { "application/json": { schema: validationErrorResponseSchema } },
};

export const passwordValidationErrorResponse: ResponseConfig = {
    description: "Dados inválidos (error e issues) ou nova senha igual à atual (message).",
    content: {
        "application/json": {
            schema: z.union([validationErrorResponseSchema, messageResponseSchema]),
            examples: {
                samePassword: {
                    value: { message: "A nova senha deve ser diferente da senha atual." },
                },
                invalidPassword: {
                    value: {
                        error: "Erro de Validação",
                        issues: [
                            {
                                code: "custom",
                                path: ["password"],
                                message: "A senha não pode conter apenas espaços",
                            },
                        ],
                    },
                },
            },
        },
    },
};

export const unauthenticatedResponse = messageResponse(
    "Cookie de acesso ausente, inválido ou expirado, conta removida ou sessão revogada.",
    "Não autenticado",
);

export const internalErrorResponse = messageResponse(
    "Falha interna ao processar a operação.",
    "Erro interno do servidor",
);

export const sessionCookieHeaders = {
    "Set-Cookie": {
        description:
            "Ocorrências separadas para accessToken e refreshToken, ambos HttpOnly e SameSite=Lax, com Secure em produção. No desenvolvimento padrão, Path=/ e Path=/auth; com AUTH_COOKIE_PATH_PREFIX=/api, Path=/api e Path=/api/auth. O navegador gerencia os cookies.",
        schema: { type: "string" as const },
    },
};

export const clearedSessionCookieHeaders = {
    "Set-Cookie": {
        description:
            "Expira os cookies accessToken e refreshToken nos caminhos configurados. Com prefixo /api, também limpa os caminhos locais anteriores.",
        schema: { type: "string" as const },
    },
};

export const swaggerSessionInstructions =
    "No Swagger, use http://localhost:5173/api/docs/, selecione /api e envie X-QuestLog-Request: true. Para renovar ou encerrar sessões pelo proxy, configure AUTH_COOKIE_PATH_PREFIX=/api no backend, reinicie-o e entre novamente. O Swagger não renova a sessão automaticamente.";
