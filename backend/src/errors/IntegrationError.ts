type IntegrationContext = {
    service: "rawg" | "brevo" | "smtp" | "mail";
    operation: "search" | "details" | "send";
    reason: "configuration" | "http" | "timeout" | "network" | "invalid_response" | "delivery";
    upstreamStatus?: number;
};

export class IntegrationError extends Error {
    constructor(
        message: string,
        public readonly context: IntegrationContext,
        cause?: unknown,
    ) {
        super(message, { cause });
        this.name = "IntegrationError";
    }
}
