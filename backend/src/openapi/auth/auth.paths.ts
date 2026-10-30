import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";
import {
    ACCESS_TOKEN_EXPIRES_IN_MINUTES,
    REFRESH_TOKEN_EXPIRES_IN_DAYS,
} from "../../constants/auth.js";
import { messageResponseSchema, validationErrorResponseSchema } from "../shared/error.schemas.js";
import { loginRequestSchema, userResponseSchema } from "./auth.schemas.js";
import { registerPasswordPaths } from "./password.paths.js";
import { registerProfilePaths } from "./profile.paths.js";
import { registerRegistrationPaths } from "./registration.paths.js";
import { registerSessionPaths } from "./session.paths.js";

export function registerAuthPaths(registry: OpenAPIRegistry) {
    registerSessionPaths(registry);
    registerRegistrationPaths(registry);
    registerProfilePaths(registry);
    registerPasswordPaths(registry);

    registry.registerPath({
        method: "get",
        path: "/auth/me",
        operationId: "getCurrentUser",
        tags: ["Autenticação"],
        summary: "Consultar o usuário da sessão atual",
        description:
            "Retorna id, name e email do usuário autenticado pelo cookie HttpOnly accessToken. Não recebe corpo ou parâmetros e não exige o cabeçalho CSRF para esta consulta GET. Para executar pelo Swagger, abra http://localhost:5173/api/docs/, selecione o servidor /api e faça login por POST /auth/login; o navegador envia o cookie automaticamente. Senhas, hashes e tokens não são retornados. Esta rota não renova a sessão; se o acesso expirar, retorna 401.",
        security: [{ cookieAuth: [] }],
        responses: {
            200: {
                description: "Dados públicos do usuário da sessão atual.",
                content: {
                    "application/json": {
                        schema: z.object({ user: userResponseSchema }),
                        example: {
                            user: { id: 1, name: "Jogador", email: "jogador@example.com" },
                        },
                    },
                },
            },
            401: {
                description:
                    "Cookie de acesso ausente, inválido ou expirado, usuário removido ou sessão revogada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Não autenticado" },
                    },
                },
            },
            403: {
                description: "Requisição rejeitada pela proteção de origem, quando configurada.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Acesso à API não permitido." },
                    },
                },
            },
            404: {
                description:
                    "Usuário não encontrado na consulta do serviço. Pode ocorrer se a conta for removida entre a autenticação e essa consulta; se já não existir ao autenticar, retorna 401.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Usuário não encontrado" },
                    },
                },
            },
            500: {
                description: "Falha interna ao autenticar ou consultar o usuário.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro interno do servidor" },
                    },
                },
            },
        },
    });

    registry.registerPath({
        method: "post",
        path: "/auth/login",
        operationId: "loginUser",
        tags: ["Autenticação"],
        summary: "Entrar na conta",
        description: `Autentica uma conta já cadastrada e verificada. Retorna os dados públicos do usuário no JSON e define os cookies HttpOnly accessToken (validade de ${ACCESS_TOKEN_EXPIRES_IN_MINUTES} minutos) e refreshToken (validade de ${REFRESH_TOKEN_EXPIRES_IN_DAYS} dias). Os tokens não são retornados no corpo. Os cookies usam SameSite=Lax e Secure em produção. No desenvolvimento padrão, os caminhos são / para acesso e /auth para renovação; com AUTH_COOKIE_PATH_PREFIX=/api, são /api e /api/auth. Para entrar pelo Swagger, abra http://localhost:5173/api/docs/, selecione o servidor /api, envie X-QuestLog-Request: true e substitua o exemplo pelas credenciais de uma conta local existente. O navegador armazena os cookies da resposta; não é necessário preencher Authorize. O Swagger não renova a sessão automaticamente. Para que o cookie de renovação também acompanhe chamadas pelo proxy /api, configure AUTH_COOKIE_PATH_PREFIX=/api no backend e entre novamente após reiniciá-lo.`,
        security: [],
        request: {
            headers: z.object({
                "X-QuestLog-Request": z.literal("true").meta({
                    description: "Cabeçalho obrigatório da proteção CSRF.",
                    example: "true",
                }),
            }),
            body: {
                required: true,
                content: {
                    "application/json": {
                        schema: loginRequestSchema,
                        example: {
                            email: "jogador@example.com",
                            password: "SenhaDeExemplo123!",
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description:
                    "Login realizado. Dados públicos no JSON e cookies de sessão nos cabeçalhos.",
                headers: {
                    "Set-Cookie": {
                        description:
                            "Enviado em ocorrências separadas para accessToken e refreshToken. Os exemplos usam os caminhos padrão de desenvolvimento; o prefixo /api e Secure dependem da configuração do ambiente. O navegador gerencia esses cookies HttpOnly.",
                        schema: { type: "string" },
                        examples: {
                            access: {
                                value: "accessToken=<token>; Path=/; HttpOnly; SameSite=Lax",
                            },
                            refresh: {
                                value: "refreshToken=<token>; Path=/auth; HttpOnly; SameSite=Lax",
                            },
                        },
                    },
                },
                content: {
                    "application/json": {
                        schema: z.object({ user: userResponseSchema }),
                        example: {
                            user: { id: 1, name: "Jogador", email: "jogador@example.com" },
                        },
                    },
                },
            },
            400: {
                description: "JSON malformado.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "JSON malformado" },
                    },
                },
            },
            401: {
                description:
                    "E-mail não cadastrado ou senha incorreta. A mensagem é a mesma nos dois casos.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Email ou senha inválidos" },
                    },
                },
            },
            403: {
                description:
                    "Origem ou cabeçalho CSRF inválido, ou acesso rejeitado pela proteção de origem.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            csrf: { value: { message: "Origem da requisição não permitida." } },
                            origin: { value: { message: "Acesso à API não permitido." } },
                        },
                    },
                },
            },
            415: {
                description: "Corpo enviado com Content-Type diferente de application/json.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "O corpo da requisição deve ser enviado em JSON." },
                    },
                },
            },
            422: {
                description:
                    "E-mail inválido, senha vazia ou com mais de 70 caracteres, ou campos desconhecidos. A senha não pode conter apenas espaços.",
                content: {
                    "application/json": { schema: validationErrorResponseSchema },
                },
            },
            429: {
                description:
                    "Limite de dez tentativas malsucedidas por IP em uma janela de quinze minutos. Logins bem-sucedidos não permanecem no contador.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: {
                            message: "Muitas tentativas de login. Tente novamente mais tarde.",
                        },
                    },
                },
            },
            500: {
                description: "Falha interna ao consultar a conta ou criar a sessão.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        example: { message: "Erro interno do servidor" },
                    },
                },
            },
        },
    });
}
