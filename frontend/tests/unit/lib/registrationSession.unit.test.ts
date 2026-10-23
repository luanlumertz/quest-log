import { assert, describe, test, vi, beforeEach, afterEach } from "vitest";

import {
    readPendingRegistration,
    storePendingRegistration,
} from "../../../src/lib/registrationSession";

describe("registrationSession", () => {
    const pending = {
        pendingRegistrationId: "11111111-1111-4111-8111-111111111111",
        email: "joao@email.com",
        expiresAt: 2_000_000,
        resendAvailableAt: 1_060_000,
    };

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

    test("deve recuperar a mesma pendência válida e permitir limpar a sessão", () => {
        assert.isNull(readPendingRegistration());

        storePendingRegistration(pending);

        assert.deepEqual(readPendingRegistration(), pending);

        storePendingRegistration(null);

        assert.isNull(readPendingRegistration());
    });

    test.each([
        { scenario: "JSON malformado", stored: "{" },
        {
            scenario: "identificador inválido",
            stored: JSON.stringify({ ...pending, pendingRegistrationId: "invalido" }),
        },
        { scenario: "prazo expirado", stored: JSON.stringify({ ...pending, expiresAt: 999_999 }) },
        {
            scenario: "dados sensíveis inesperados",
            stored: JSON.stringify({ ...pending, password: "nao-persistir" }),
        },
    ])("não deve recuperar $scenario", ({ stored }) => {
        sessionStorage.setItem("questlog:pending-registration", stored);

        assert.isNull(readPendingRegistration());
    });

    test("deve tolerar armazenamento bloqueado na leitura e na escrita", () => {
        vi.mocked(sessionStorage.getItem).mockImplementation(() => {
            throw new Error("Bloqueado");
        });
        vi.mocked(sessionStorage.setItem).mockImplementation(() => {
            throw new Error("Bloqueado");
        });
        vi.mocked(sessionStorage.removeItem).mockImplementation(() => {
            throw new Error("Bloqueado");
        });

        assert.isNull(readPendingRegistration());
        assert.doesNotThrow(() => storePendingRegistration(pending));
        assert.doesNotThrow(() => storePendingRegistration(null));
    });
});
