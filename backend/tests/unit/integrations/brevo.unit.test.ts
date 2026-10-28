import { afterEach, beforeEach, describe, test, expect, assert, vi } from "vitest";

import { sendBrevoEmail } from "../../../src/integrations/brevo.js";
import {
    mockFetchError,
    mockFetchInvalidJson,
    mockFetchResponse,
} from "../../helpers/http/mockFetch.helper.js";

const message = {
    to: "destinatario@example.com",
    subject: "Código de verificação",
    text: "Seu código é 012345.",
    html: '<p>012345</p><img src="cid:questlog-logo" />',
};

describe("sendBrevoEmail", () => {
    beforeEach(() => {
        vi.stubEnv("BREVO_API_KEY", "chave-ficticia");
        vi.stubEnv("BREVO_SENDER_EMAIL", "questlog@example.com");
        vi.stubEnv("BREVO_SENDER_NAME", "QuestLog");
        vi.stubEnv("FRONTEND_URL", "https://questlog.example.com");
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    test("deve enviar por HTTPS com autenticação, texto, HTML e logo pública", async () => {
        const fetchMock = mockFetchResponse({ messageId: "<email-aceito>" }, 201);

        await sendBrevoEmail(message);

        const [url, options] = fetchMock.mock.calls[0]!;
        assert.equal(fetchMock.mock.calls.length, 1);
        assert.equal(url, "https://api.brevo.com/v3/smtp/email");
        assert.equal(options?.method, "POST");
        expect(options?.headers).toMatchObject({
            "api-key": "chave-ficticia",
            "Content-Type": "application/json",
        });
        expect(options?.signal).toBeInstanceOf(AbortSignal);

        const body = JSON.parse(options?.body as string);
        assert.deepEqual(body, {
            sender: { name: "QuestLog", email: "questlog@example.com" },
            to: [{ email: message.to }],
            subject: message.subject,
            textContent: message.text,
            htmlContent:
                '<p>012345</p><img src="https://questlog.example.com/favicon/android-chrome-192x192.png" />',
        });
        assert.notInclude(options?.body as string, "chave-ficticia");
    });

    test("deve aceitar envio somente em texto sem exigir URL de logo", async () => {
        vi.stubEnv("BREVO_SENDER_NAME", "");
        vi.stubEnv("FRONTEND_URL", "");
        const fetchMock = mockFetchResponse({ messageId: "<email-aceito>" }, 201);

        await sendBrevoEmail({ to: message.to, subject: message.subject, text: message.text });

        const body = JSON.parse(fetchMock.mock.calls[0]![1]?.body as string);
        assert.notProperty(body, "htmlContent");
        assert.equal(body.sender.name, "QuestLog");
    });

    test.each(["BREVO_API_KEY", "BREVO_SENDER_EMAIL"])(
        "deve rejeitar configuração sem %s",
        async (field) => {
            vi.stubEnv(field, "");
            const fetchMock = mockFetchResponse({ messageId: "<email>" });

            await expect(sendBrevoEmail(message)).rejects.toThrow("Configuração Brevo incompleta");

            assert.equal(fetchMock.mock.calls.length, 0);
        },
    );

    test.each(["", "http://localhost:5173"])(
        "deve impedir logo sem endereço HTTPS público: %s",
        async (url) => {
            vi.stubEnv("FRONTEND_URL", url);
            const fetchMock = mockFetchResponse({ messageId: "<email>" });

            await expect(sendBrevoEmail(message)).rejects.toThrow(/FRONTEND_URL/);

            assert.equal(fetchMock.mock.calls.length, 0);
        },
    );

    test.each([401, 403, 429, 500])(
        "deve propagar erro HTTP %i sem expor a resposta do provedor",
        async (status) => {
            mockFetchResponse({ message: "detalhe interno" }, status);

            await expect(sendBrevoEmail(message)).rejects.toMatchObject({
                message: `Falha no envio pela Brevo (HTTP ${status})`,
                context: {
                    service: "brevo",
                    operation: "send",
                    reason: "http",
                    upstreamStatus: status,
                },
            });
        },
    );

    test.each([
        new TypeError("rede indisponível"),
        new DOMException("tempo esgotado", "TimeoutError"),
    ])("deve tratar falhas de conexão ou timeout sem repetições automáticas", async (error) => {
        const fetchMock = mockFetchError(error);

        await expect(sendBrevoEmail(message)).rejects.toThrow(
            "Não foi possível comunicar com a Brevo",
        );

        assert.equal(fetchMock.mock.calls.length, 1);
    });

    test.each([{}, { messageId: "" }])("deve rejeitar confirmação inválida %j", async (body) => {
        mockFetchResponse(body, 201);

        await expect(sendBrevoEmail(message)).rejects.toThrow(
            "Resposta inválida ao enviar e-mail pela Brevo",
        );
    });

    test("deve rejeitar uma resposta que não seja JSON", async () => {
        mockFetchInvalidJson();

        await expect(sendBrevoEmail(message)).rejects.toThrow(
            "Resposta inválida ao enviar e-mail pela Brevo",
        );
    });
});
