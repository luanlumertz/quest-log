import { afterEach, assert, beforeEach, describe, test, vi } from "vitest";

import {
    clearPasswordChangeNotice,
    readPasswordChangeNotice,
    storePasswordChangeNotice,
} from "../../../src/lib/passwordChangeNotice";

describe("passwordChangeNotice", () => {
    beforeEach(() => {
        const values = new Map<string, string>();

        vi.spyOn(Date, "now").mockReturnValue(1_000_000);
        vi.stubGlobal("sessionStorage", {
            getItem: vi.fn((key: string) => values.get(key) ?? null),
            setItem: vi.fn((key: string, value: string) => {
                values.set(key, value);
            }),
            removeItem: vi.fn((key: string) => {
                values.delete(key);
            }),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test.each(["joao@email.com", undefined])(
        "deve guardar um aviso temporário com e-mail %s",
        (email) => {
            assert.isNull(readPasswordChangeNotice());

            storePasswordChangeNotice(email);

            assert.deepEqual(readPasswordChangeNotice(), {
                ...(email ? { email } : {}),
                expiresAt: 1_060_000,
            });

            clearPasswordChangeNotice();

            assert.isNull(readPasswordChangeNotice());
        },
    );

    test.each([
        "{",
        JSON.stringify({ email: "inválido", expiresAt: 1_060_000 }),
        JSON.stringify({ email: "joao@email.com", expiresAt: 1_000_000 }),
    ])("deve ignorar um aviso inválido ou expirado: %s", (stored) => {
        sessionStorage.setItem("questlog:password-changed", stored);

        assert.isNull(readPasswordChangeNotice());
    });

    test("deve tolerar falhas ao ler, guardar ou remover o aviso", () => {
        const blocked = () => {
            throw new Error("Bloqueado");
        };

        vi.mocked(sessionStorage.getItem).mockImplementation(blocked);
        vi.mocked(sessionStorage.setItem).mockImplementation(blocked);
        vi.mocked(sessionStorage.removeItem).mockImplementation(blocked);

        assert.isNull(readPasswordChangeNotice());
        assert.doesNotThrow(() => storePasswordChangeNotice("joao@email.com"));
        assert.doesNotThrow(clearPasswordChangeNotice);
    });
});
