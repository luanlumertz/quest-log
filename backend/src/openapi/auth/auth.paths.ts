import { getAppEnvironment } from "../../lib/appEnvironment.js";
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
    const isSandbox = getAppEnvironment() === "sandbox";
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
        description: isSandbox
            ? "Retorna id, name e email pelo cookie accessToken. Faça login por POST /auth/login nesta documentação. O navegador envia os cookies automaticamente. Esta consulta GET não exige cabeçalho CSRF, não retorna senhas ou tokens e não renova a sessão."
            : "Retorna id, name e email do usuário autenticado pelo cookie HttpOnly accessToken. Não recebe corpo ou parâmetros e não exige o cabeçalho CSRF para esta consulta GET. Para executar pelo Swagger, abra http://localhost:5173/api/docs/, selecione o servidor /api e faça login por POST /auth/login; o navegador envia o cookie automaticamente. Senhas, hashes e tokens não são retornados. Esta rota não renova a sessão; se o acesso expirar, retorna 401.",
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
        description: isSandbox
            ? `Autentica uma conta cadastrada e verificada neste sandbox. Retorna os dados públicos do usuário e define cookies HttpOnly accessToken (validade de ${ACCESS_TOKEN_EXPIRES_IN_MINUTES} minutos, Path=/) e refreshToken (validade de ${REFRESH_TOKEN_EXPIRES_IN_DAYS} dias, Path=/auth), ambos Secure e SameSite=Lax. Os tokens não são retornados no JSON. Envie X-QuestLog-Request: true e use uma conta criada neste ambiente. O navegador guarda e envia os cookies automaticamente. A renovação por /auth/refresh continua manual.`
            : `Autentica uma conta já cadastrada e verificada. Retorna os dados públicos do usuário no JSON e define os cookies HttpOnly accessToken (validade de ${ACCESS_TOKEN_EXPIRES_IN_MINUTES} minutos) e refreshToken (validade de ${REFRESH_TOKEN_EXPIRES_IN_DAYS} dias). Os tokens não são retornados no corpo. Os cookies usam SameSite=Lax e Secure em produção. No desenvolvimento padrão, os caminhos são / para acesso e /auth para renovação; com AUTH_COOKIE_PATH_PREFIX=/api, são /api e /api/auth. Para entrar pelo Swagger, abra http://localhost:5173/api/docs/, selecione o servidor /api, envie X-QuestLog-Request: true e substitua o exemplo pelas credenciais de uma conta local existente. O navegador armazena os cookies da resposta e os envia automaticamente nas próximas requisições. O Swagger não renova a sessão automaticamente. Para que o cookie de renovação também acompanhe chamadas pelo proxy /api, configure AUTH_COOKIE_PATH_PREFIX=/api no backend e entre novamente após reiniciá-lo.`,
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
                            "Enviado em ocorrências separadas para accessToken e refreshToken. Os exemplos representam o sandbox HTTPS ou o proxy local com AUTH_COOKIE_PATH_PREFIX=/api. Com esse prefixo, também são enviados cabeçalhos para expirar cookies dos caminhos antigos. O navegador gerencia os cookies HttpOnly.",
                        schema: { type: "string" },
                        examples: {
                            access: {
                                value: isSandbox
                                    ? "accessToken=<token>; Path=/; HttpOnly; Secure; SameSite=Lax"
                                    : "accessToken=<token>; Path=/api; HttpOnly; SameSite=Lax",
                            },
                            refresh: {
                                value: isSandbox
                                    ? "refreshToken=<token>; Path=/auth; HttpOnly; Secure; SameSite=Lax"
                                    : "refreshToken=<token>; Path=/api/auth; HttpOnly; SameSite=Lax",
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
                    "E-mail não cadastrado ou senha incorreta retornam a mesma mensagem. Também pode ocorrer se a conta for removida ou a versão da sessão mudar durante a criação da sessão de login.",
                content: {
                    "application/json": {
                        schema: messageResponseSchema,
                        examples: {
                            credentials: { value: { message: "Email ou senha inválidos" } },
                            session: { value: { message: "Sessão inválida" } },
                        },
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
