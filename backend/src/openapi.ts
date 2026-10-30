import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registerAuthPaths } from "./openapi/auth/auth.paths.js";
import { registerLibraryPaths } from "./openapi/library/library.paths.js";
import { registerSecuritySchemes } from "./openapi/shared/security.js";
import { getAppEnvironment } from "./lib/appEnvironment.js";

const isSandbox = getAppEnvironment() === "sandbox";
const openApiRegistry = new OpenAPIRegistry();

registerSecuritySchemes(openApiRegistry);
registerAuthPaths(openApiRegistry);
registerLibraryPaths(openApiRegistry);

const generator = new OpenApiGeneratorV31(openApiRegistry.definitions);

export const openApiDocument = generator.generateDocument({
    openapi: "3.1.0",
    info: {
        title: isSandbox ? "QuestLog API · Sandbox" : "QuestLog API",
        version: "1.0.0",
        description: isSandbox
            ? "Ambiente público de demonstração, separado da aplicação principal. As operações alteram os dados deste sandbox. Cadastre uma conta e faça login para experimentar as rotas protegidas. Não use dados pessoais ou senhas de outras contas. A autenticação usa cookies enviados automaticamente pelo navegador."
            : "API para gerenciar bibliotecas pessoais de jogos e acompanhar o progresso dos jogadores.",
    },
    servers: isSandbox
        ? [{ url: "/", description: "API sandbox · mesmo endereço desta documentação" }]
        : [
              {
                  url: "http://localhost:3000",
                  description: "Ambiente de desenvolvimento local",
              },
              {
                  url: "/api",
                  description:
                      "Proxy local do Vite · abra a documentação em localhost:5173/api/docs/",
              },
          ],
});
