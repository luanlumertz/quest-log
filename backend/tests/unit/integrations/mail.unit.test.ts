import { describe, test, assert, expect, vi, beforeEach, afterEach } from "vitest";
import nodemailer from "nodemailer";

import { sendEmail } from "../../../src/integrations/mail.js";

const { sendMail } = vi.hoisted(() => ({ sendMail: vi.fn(async () => {}) }));

vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail })) } }));

describe("sendEmail", () => {
    beforeEach(() => {
        vi.stubEnv("SMTP_HOST", "localhost");
        vi.stubEnv("SMTP_PORT", "1025");
        vi.stubEnv("SMTP_FROM", "QuestLog <noreply@questlog.local>");

        vi.clearAllMocks();
    });

    afterEach(() => vi.unstubAllEnvs());

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
        expect(sendMail).toHaveBeenCalledWith({ ...message, from: process.env.SMTP_FROM });
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
        ).rejects.toThrow("SMTP indisponível");
    });
});
