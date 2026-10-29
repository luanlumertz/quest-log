import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registerLibraryPaths } from "./openapi/library/library.paths.js";
import { registerSecuritySchemes } from "./openapi/shared/security.js";

const openApiRegistry = new OpenAPIRegistry();

registerSecuritySchemes(openApiRegistry);
registerLibraryPaths(openApiRegistry);

const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);

export const openApiDocument = generator.generateDocument({
    openapi: "3.1.0",
    info: {
        title: "QuestLog API",
        version: "1.0.0",
        description:
            "API para gerenciar bibliotecas pessoais de jogos e acompanhar o progresso dos jogadores.",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Ambiente de desenvolvimento local",
        },
        {
            url: "/api",
            description: "Proxy local do Vite · abra a documentação em localhost:5173/api/docs/",
        },
    ],
});
