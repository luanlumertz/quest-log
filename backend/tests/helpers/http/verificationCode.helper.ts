import { vi } from "vitest";

import { sendEmail } from "../../../src/integrations/mail.js";

export function getLastVerificationCode() {
    const lastCall = vi.mocked(sendEmail).mock.calls.at(-1);

    if (!lastCall) {
        throw new Error("O backend deve enviar o e-mail de verificação");
    }

    const code = lastCall[0].text.match(/\b\d{6}\b/)?.[0];

    if (!code) {
        throw new Error("O e-mail deve conter um código de seis dígitos");
    }

    return code;
}
