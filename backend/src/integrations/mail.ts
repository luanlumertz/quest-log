import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { sendBrevoEmail } from "./brevo.js";
import type { SendEmailOptions } from "../types/mail.types.js";
import { IntegrationError } from "../errors/IntegrationError.js";

export async function sendEmail(options: SendEmailOptions) {
    const provider =
        process.env.EMAIL_PROVIDER ?? (process.env.NODE_ENV === "production" ? "brevo" : "smtp");

    if (provider === "brevo") return sendBrevoEmail(options);
    if (provider !== "smtp")
        throw new IntegrationError("Provedor de e-mail inválido", {
            service: "mail",
            operation: "send",
            reason: "configuration",
        });

    const { to, subject, text, html } = options;
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const from = process.env.SMTP_FROM;

    if (!host || !port || !from) {
        throw new IntegrationError("Configuração SMTP incompleta", {
            service: "smtp",
            operation: "send",
            reason: "configuration",
        });
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
    });

    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
            attachments: html?.includes("cid:questlog-logo")
                ? [
                      {
                          filename: "questlog-logo.png",
                          path: fileURLToPath(
                              new URL("../assets/questlog-logo.png", import.meta.url),
                          ),
                          cid: "questlog-logo",
                          contentDisposition: "inline",
                          contentType: "image/png",
                      },
                  ]
                : [],
        });
    } catch (error) {
        throw new IntegrationError(
            "Falha no envio SMTP",
            { service: "smtp", operation: "send", reason: "delivery" },
            error,
        );
    }
}
