import { z } from "zod";
import type { SendEmailOptions } from "../types/mail.types.js";

const responseSchema = z.object({ messageId: z.string().min(1) });

export async function sendBrevoEmail({ to, subject, text, html }: SendEmailOptions) {
    const apiKey = process.env.BREVO_API_KEY;
    const email = process.env.BREVO_SENDER_EMAIL;
    const name = process.env.BREVO_SENDER_NAME || "QuestLog";

    if (!apiKey || !email) {
        throw new Error("Configuração Brevo incompleta");
    }

    let htmlContent = html;
    if (htmlContent?.includes("cid:questlog-logo")) {
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) throw new Error("FRONTEND_URL necessária para a logo dos e-mails");

        const logoUrl = new URL("/favicon/android-chrome-192x192.png", frontendUrl);
        if (logoUrl.protocol !== "https:") {
            throw new Error("A logo dos e-mails da Brevo exige FRONTEND_URL com HTTPS");
        }

        htmlContent = htmlContent.replaceAll("cid:questlog-logo", logoUrl.href);
    }

    let response: Response;
    try {
        response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                sender: { name, email },
                to: [{ email: to }],
                subject,
                textContent: text,
                ...(htmlContent ? { htmlContent } : {}),
            }),
            signal: AbortSignal.timeout(10_000),
        });
    } catch {
        // Não inclui credenciais nem conteúdo sensível da requisição nos logs.
        throw new Error("Não foi possível comunicar com a Brevo");
    }

    if (!response.ok) {
        throw new Error(`Falha no envio pela Brevo (HTTP ${response.status})`);
    }

    try {
        responseSchema.parse(await response.json());
    } catch {
        throw new Error("Resposta inválida ao enviar e-mail pela Brevo");
    }
}
