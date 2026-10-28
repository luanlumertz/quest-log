import { describe, test, assert, expect, vi, beforeEach, afterEach } from "vitest";
import nodemailer from "nodemailer";

import { sendEmail } from "../../../src/integrations/mail.js";
import { sendBrevoEmail } from "../../../src/integrations/brevo.js";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn(async () => {}) }));

vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail })) } }));
vi.mock("../../../src/integrations/brevo.js", () => ({ sendBrevoEmail: vi.fn(async () => {}) }));

describe("sendEmail", () => {
    beforeEach(() => {
        vi.stubEnv("EMAIL_PROVIDER", "smtp");
        vi.stubEnv("SMTP_HOST", "localhost");
        vi.stubEnv("SMTP_PORT", "1025");
        vi.stubEnv("SMTP_FROM", "QuestLog <noreply@questlog.local>");

        vi.clearAllMocks();
    });

    afterEach(() => vi.unstubAllEnvs());

    test.each(["production", "development"])(
        "deve selecionar o provedor padrão para NODE_ENV=%s",
        async (environment) => {
            vi.stubEnv("EMAIL_PROVIDER", undefined);
            vi.stubEnv("NODE_ENV", environment);
            const message = { to: "teste@email.com", subject: "Teste", text: "Código: 123456" };

            await sendEmail(message);

            if (environment === "production") {
                expect(sendBrevoEmail).toHaveBeenCalledWith(message);
                expect(sendMail).not.toHaveBeenCalled();
            } else {
                expect(sendMail).toHaveBeenCalled();
                expect(sendBrevoEmail).not.toHaveBeenCalled();
            }
        },
    );

    test("deve permitir selecionar Brevo explicitamente e propagar falhas", async () => {
        vi.stubEnv("EMAIL_PROVIDER", "brevo");
        vi.mocked(sendBrevoEmail).mockRejectedValueOnce(new Error("Falha Brevo"));

        await expect(
            sendEmail({ to: "teste@email.com", subject: "Teste", text: "Teste" }),
        ).rejects.toThrow("Falha Brevo");

        expect(sendMail).not.toHaveBeenCalled();
    });

    test("deve rejeitar um provedor desconhecido sem enviar e-mail", async () => {
        vi.stubEnv("EMAIL_PROVIDER", "invalido");

        await expect(
            sendEmail({ to: "teste@email.com", subject: "Teste", text: "Teste" }),
        ).rejects.toThrow("Provedor de e-mail inválido");

        expect(sendMail).not.toHaveBeenCalled();
        expect(sendBrevoEmail).not.toHaveBeenCalled();
    });

    test("deve configurar o transporte e enviar texto e HTML", async () => {
        const message = {
            to: "teste@email.com",
            subject: "Verificação",
            text: "Código: 123456",
            html: "<p>123456</p>",
        };

        await sendEmail(message);

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            host: "localhost",
            port: 1025,
            secure: false,
        });
        expect(sendMail).toHaveBeenCalledWith({
            ...message,
            from: process.env.SMTP_FROM,
            attachments: [],
        });
    });

    test("deve enviar a logo como imagem inline referenciada pelo HTML", async () => {
        await sendEmail({
            to: "teste@email.com",
            subject: "Teste",
            text: "Código: 123456",
            html: '<img src="cid:questlog-logo" />',
        });

        expect(sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                attachments: [
                    expect.objectContaining({
                        cid: "questlog-logo",
                        contentDisposition: "inline",
                        contentType: "image/png",
                        path: expect.stringContaining("questlog-logo.png"),
                    }),
                ],
            }),
        );
    });

    test.each(["SMTP_HOST", "SMTP_PORT", "SMTP_FROM"])(
        "deve rejeitar configuração sem %s antes de enviar",
        async (field) => {
            vi.stubEnv(field, "");

            await expect(
                sendEmail({ to: "teste@email.com", subject: "Teste", text: "Teste" }),
            ).rejects.toThrow("Configuração SMTP incompleta");

            assert.equal(sendMail.mock.calls.length, 0);
        },
    );

    test("deve propagar a falha SMTP para o tratamento do serviço", async () => {
        sendMail.mockRejectedValueOnce(new Error("SMTP indisponível"));

        await expect(
            sendEmail({ to: "teste@email.com", subject: "Teste", text: "Teste" }),
        ).rejects.toMatchObject({
            message: "Falha no envio SMTP",
            context: { service: "smtp", reason: "delivery" },
            cause: { message: "SMTP indisponível" },
        });
    });
});
