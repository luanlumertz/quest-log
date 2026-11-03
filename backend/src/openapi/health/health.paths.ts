import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import z from "zod";

export function registerHealthPaths(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/healthz",
        operationId: "getApiHealth",
        tags: ["Saúde da API"],
        summary: "Verificar se o servidor responde",
        description:
            "Verificação simples de disponibilidade do servidor HTTP, usada pelo healthcheck da hospedagem. Não exige autenticação, cookies, cabeçalho CSRF ou o cabeçalho privado de origem. Não recebe corpo ou parâmetros documentados. Retorna status: ok quando a requisição chega ao handler. Não consulta o banco de dados, a RAWG ou o provedor de e-mail; portanto, uma resposta 200 não garante que essas dependências estejam disponíveis. Se o servidor estiver indisponível, a requisição pode falhar sem uma resposta JSON da aplicação.",
        security: [],
        responses: {
            200: {
                description: "O servidor HTTP está respondendo.",
                content: {
                    "application/json": {
                        schema: z.object({ status: z.literal("ok") }),
                        example: { status: "ok" },
                    },
                },
            },
        },
    });
}
