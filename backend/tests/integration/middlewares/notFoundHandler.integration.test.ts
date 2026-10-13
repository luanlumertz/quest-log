import { describe, test, assert } from "vitest";

import { requestNotFoundRoute } from "../../requests/middlewares/notFound.request.js";

describe("notFoundHandler.middleware.ts", () => {
    test("deve retornar 404 ao acessar uma rota inexistente", async () => {
        const response = await requestNotFoundRoute();

        const bodyMessage = response.body.message;

        assert.equal(response.status, 404);
        assert.equal(bodyMessage, "Rota não encontrada");
    });
});
