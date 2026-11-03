import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registerAuthPaths } from "./openapi/auth/auth.paths.js";
import { registerLibraryPaths } from "./openapi/library/library.paths.js";
import { registerSecuritySchemes } from "./openapi/shared/security.js";
import { getAppEnvironment } from "./lib/appEnvironment.js";
import { gettingStartedInstructions } from "./openapi/shared/usage.js";
import { registerGamePaths } from "./openapi/games/game.paths.js";
import { registerDashboardPaths } from "./openapi/dashboard/dashboard.paths.js";
import { registerHealthPaths } from "./openapi/health/health.paths.js";

const isSandbox = getAppEnvironment() === "sandbox";
const openApiRegistry = new OpenAPIRegistry();

registerSecuritySchemes(openApiRegistry);
registerAuthPaths(openApiRegistry);
registerLibraryPaths(openApiRegistry);
registerGamePaths(openApiRegistry);
registerDashboardPaths(openApiRegistry);
registerHealthPaths(openApiRegistry);

const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);

export const openApiDocument = generator.generateDocument({
    openapi: "3.1.0",
    info: {
        title: isSandbox ? "QuestLog API · Sandbox" : "QuestLog API",
        version: "1.0.0",
        description:
            (isSandbox
                ? "Ambiente público de demonstração, separado da aplicação principal. As operações alteram os dados deste sandbox. Cadastre uma conta e faça login para experimentar as rotas protegidas. As contas são temporárias e podem ser removidas após mais de 30 dias sem atividade. Não use dados pessoais ou senhas de outras contas. A autenticação usa cookies enviados automaticamente pelo navegador."
                : "API para gerenciar bibliotecas pessoais de jogos e acompanhar o progresso dos jogadores. Para testar localmente, abra http://localhost:5173/api/docs/ com o frontend e o backend em execução.") +
            "\n\n" +
            gettingStartedInstructions,
    },
    servers: isSandbox
        ? [{ url: "/", description: "API sandbox" }]
        : [
              {
                  url: "/api",
                  description: "Proxy local do Vite",
              },
          ],
});

// Modelos na ordem dos grupos de rotas; mensagens e erros compartilhados ao final.
const schemaOrder = [
    "User",
    "LibraryEntry",
    "CreatedLibraryEntry",
    "LibraryEntryDetails",
    "GameSummary",
    "GameDetails",
    "GameSearchResponse",
    "DashboardStats",
    "DashboardRecentGame",
    "DashboardData",
    "MessageResponse",
    "ValidationErrorResponse",
];

if (openApiDocument.components?.schemas) {
    const schemas = openApiDocument.components.schemas;
    openApiDocument.components.schemas = Object.fromEntries([
        ...schemaOrder.filter((name) => name in schemas).map((name) => [name, schemas[name]]),
        ...Object.entries(schemas).filter(([name]) => !schemaOrder.includes(name)),
    ]);
}
