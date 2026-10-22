import { vi } from "vitest";

vi.mock("../../src/integrations/mail.js", () => ({
    sendEmail: vi.fn(async () => {}),
}));
