import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { sendBrevoEmail } from "./brevo.js";
import type { SendEmailOptions } from "../types/mail.types.js";

export async function sendEmail(options: SendEmailOptions) {
    const provider =
        process.env.EMAIL_PROVIDER ?? (process.env.NODE_ENV === "production" ? "brevo" : "smtp");

    if (provider === "brevo") return sendBrevoEmail(options);
    if (provider !== "smtp") throw new Error("Provedor de e-mail inválido");

    const { to, subject, text, html } = options;
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const from = process.env.SMTP_FROM;

    if (!host || !port || !from) {
        throw new Error("Configuração SMTP incompleta");
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
    });

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
                      path: fileURLToPath(new URL("../assets/questlog-logo.png", import.meta.url)),
                      cid: "questlog-logo",
                      contentDisposition: "inline",
                      contentType: "image/png",
                  },
              ]
            : [],
    });
}
