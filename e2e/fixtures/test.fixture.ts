import { randomUUID } from "node:crypto";
import { test as base } from "@playwright/test";
import { deleteTestUserByEmail, withE2EDatabase } from "../helpers/db.helper";
import { deleteEmailsForRecipient } from "../helpers/mailpit.helper";
import { createAuthenticatedUser } from "../helpers/auth.helper";
import { mockGameCatalog } from "../helpers/rawg.helper";
import { E2E_GAME } from "./game.fixture";

export const test = base.extend<{
    testEmail: string;
    authenticatedUser: Awaited<ReturnType<typeof createAuthenticatedUser>>;
    catalogGame: typeof E2E_GAME;
}>({
    extraHTTPHeaders: async ({ extraHTTPHeaders }, use) => {
        await use({ ...extraHTTPHeaders, "X-E2E-Test-ID": randomUUID() });
    },
    testEmail: async ({ request }, use) => {
        const email = `e2e-${randomUUID()}@example.test`;

        try {
            await use(email);
        } finally {
            try {
                await deleteTestUserByEmail(email);
            } finally {
                await deleteEmailsForRecipient(request, email);
            }
        }
    },
    authenticatedUser: async ({ page, testEmail }, use) => {
        const user = await createAuthenticatedUser(page, testEmail);
        await use(user);
    },
    catalogGame: async ({ page }, use) => {
        const game = await withE2EDatabase((db) =>
            db.game.findUnique({ where: { externalId: E2E_GAME.externalId } }),
        );

        if (!game) {
            throw new Error(
                "O jogo E2E não foi preparado. Confira o globalSetup ou execute npm --prefix backend run e2e:seed.",
            );
        }

        await mockGameCatalog(page);
        await use(E2E_GAME);
    },
});

export { expect } from "@playwright/test";
