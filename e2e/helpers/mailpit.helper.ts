import { expect, type APIRequestContext } from "@playwright/test";
import { MAILPIT_URL } from "./env.helper";

export async function deleteEmailsForRecipient(request: APIRequestContext, email: string) {
    if (!email.trim()) {
        throw new Error("Informe o destinatário para limpar os e-mails.");
    }

    const response = await request.delete(`${MAILPIT_URL}/api/v1/search`, {
        params: { query: `to:${email}` },
    });

    expect(response.ok()).toBeTruthy();
}
