import express from "express";
import request from "supertest";
import { afterEach, describe, expect, test, vi } from "vitest";
import { getTrustProxyHops } from "../../../src/lib/trustProxy.js";

describe("trust proxy", () => {
    afterEach(() => vi.unstubAllEnvs());

    test("deve ignorar cabeçalhos encaminhados por padrão no acesso direto", async () => {
        vi.stubEnv("TRUST_PROXY_HOPS", undefined);
        const app = express();
        app.set("trust proxy", getTrustProxyHops());
        app.get("/", (req, res) => res.json({ ips: req.ips }));

        const response = await request(app).get("/").set("X-Forwarded-For", "203.0.113.10");

        expect(app.get("trust proxy")).toBe(0);
        expect(response.body.ips).toEqual([]);
    });

    test("deve confiar somente no salto configurado e ignorar IPs adicionais à esquerda", async () => {
        vi.stubEnv("TRUST_PROXY_HOPS", "1");
        const app = express();
        app.set("trust proxy", getTrustProxyHops());
        app.get("/", (req, res) => res.json({ ip: req.ip }));

        const response = await request(app)
            .get("/")
            .set("X-Forwarded-For", "198.51.100.99, 203.0.113.10");

        expect(response.body.ip).toBe("203.0.113.10");
    });

    test.each(["true", "-1", "1.5", "", "9007199254740992"])(
        "deve rejeitar configuração inválida: %s",
        (value) => {
            vi.stubEnv("TRUST_PROXY_HOPS", value);

            expect(() => getTrustProxyHops()).toThrow(
                "TRUST_PROXY_HOPS deve ser um inteiro maior ou igual a zero.",
            );
        },
    );
});
