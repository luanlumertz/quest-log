import { assert, describe, test } from "vitest";
import { getHealth } from "../../requests/health/health.request.js";

describe("GET /healthz", () => {
    test("deve retornar status 200 e indicar que a API está funcionando", async () => {
        const response = await getHealth();

        assert.equal(response.status, 200);
        assert.equal(response.headers["cache-control"], "no-store");
        assert.deepEqual(response.body, { status: "ok" });
    });
});
