import { z } from "zod";
import type { SendEmailOptions } from "../types/mail.types.js";
import { IntegrationError } from "../errors/IntegrationError.js";

const responseSchema = z.object({ messageId: z.string().min(1) });

export async function sendBrevoEmail({ to, subject, text, html }: SendEmailOptions) {
    const apiKey = process.env.BREVO_API_KEY;
    const email = process.env.BREVO_SENDER_EMAIL;
    const name = process.env.BREVO_SENDER_NAME || "QuestLog";

    if (!apiKey || !email) {
        throw new IntegrationError("Configuração Brevo incompleta", {
            service: "brevo",
            operation: "send",
            reason: "configuration",
        });
    }

    let htmlContent = html;
    if (htmlContent?.includes("cid:questlog-logo")) {
        const configuredLogoUrl = process.env.EMAIL_LOGO_URL;
        const frontendUrl = process.env.FRONTEND_URL;
        if (!configuredLogoUrl && !frontendUrl)
            throw new IntegrationError("FRONTEND_URL necessária para a logo dos e-mails", {
                service: "brevo",
                operation: "send",
                reason: "configuration",
            });

        const logoUrl = z
            .url()
            .safeParse(
                configuredLogoUrl ??
                    new URL("/favicon/android-chrome-192x192.png", frontendUrl).href,
            );
        if (!logoUrl.success || new URL(logoUrl.data).protocol !== "https:") {
            throw new IntegrationError(
                "A logo dos e-mails da Brevo exige EMAIL_LOGO_URL ou FRONTEND_URL com HTTPS",
                {
                    service: "brevo",
                    operation: "send",
                    reason: "configuration",
                },
            );
        }

        htmlContent = htmlContent.replaceAll("cid:questlog-logo", logoUrl.data);
    }

    let response: Response;
    const signal = AbortSignal.timeout(10_000);
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
            signal,
        });
    } catch (error) {
        throw new IntegrationError(
            "Não foi possível comunicar com a Brevo",
            {
                service: "brevo",
                operation: "send",
                reason: signal.aborted ? "timeout" : "network",
            },
            error,
        );
    }

    if (!response.ok) {
        throw new IntegrationError(`Falha no envio pela Brevo (HTTP ${response.status})`, {
            service: "brevo",
            operation: "send",
            reason: "http",
            upstreamStatus: response.status,
        });
    }

    try {
        responseSchema.parse(await response.json());
    } catch (error) {
        throw new IntegrationError(
            "Resposta inválida ao enviar e-mail pela Brevo",
            {
                service: "brevo",
                operation: "send",
                reason: "invalid_response",
            },
            error,
        );
    }
}
