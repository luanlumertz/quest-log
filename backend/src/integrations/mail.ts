import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

type SendEmailOptions = {
    to: string;
    subject: string;
    text: string;
    html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
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
