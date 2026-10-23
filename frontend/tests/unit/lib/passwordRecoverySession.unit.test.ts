import { afterEach, assert, beforeEach, describe, test, vi } from "vitest";

import {
    readPasswordRecovery,
    storePasswordRecovery,
} from "../../../src/lib/passwordRecoverySession";

describe("passwordRecoverySession", () => {
    const recovery = { email: "joao@email.com", resendAvailableAt: 1_060_000 };

    beforeEach(() => {
        const values = new Map<string, string>();

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

    afterEach(() => vi.unstubAllGlobals());

    test("deve guardar apenas e-mail e cooldown e permitir limpar a recuperação", () => {
        const sensitiveRecovery = {
            ...recovery,
            password: "senha secreta",
            code: "012345",
            resetToken: "token secreto",
        };

        assert.isNull(readPasswordRecovery());

        storePasswordRecovery(sensitiveRecovery);

        assert.deepEqual(readPasswordRecovery(), recovery);
        assert.deepEqual(
            JSON.parse(sessionStorage.getItem("questlog:password-recovery")!),
            recovery,
        );

        storePasswordRecovery(null);

        assert.isNull(readPasswordRecovery());
    });

    test.each([
        { scenario: "JSON malformado", stored: "{" },
        { scenario: "e-mail inválido", stored: JSON.stringify({ ...recovery, email: "inválido" }) },
        {
            scenario: "prazo inválido",
            stored: JSON.stringify({ ...recovery, resendAvailableAt: -1 }),
        },
        {
            scenario: "token persistido",
            stored: JSON.stringify({ ...recovery, resetToken: "segredo" }),
        },
    ])("não deve recuperar $scenario", ({ stored }) => {
        sessionStorage.setItem("questlog:password-recovery", stored);

        assert.isNull(readPasswordRecovery());
    });

    test("deve tolerar armazenamento bloqueado sem interromper o fluxo em memória", () => {
        const blocked = () => {
            throw new Error("Bloqueado");
        };

        vi.mocked(sessionStorage.getItem).mockImplementation(blocked);
        vi.mocked(sessionStorage.setItem).mockImplementation(blocked);
        vi.mocked(sessionStorage.removeItem).mockImplementation(blocked);

        assert.isNull(readPasswordRecovery());
        assert.doesNotThrow(() => storePasswordRecovery(recovery));
        assert.doesNotThrow(() => storePasswordRecovery(null));
    });
});
