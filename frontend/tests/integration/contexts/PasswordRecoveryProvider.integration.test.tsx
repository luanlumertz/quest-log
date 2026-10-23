import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { useRef, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PasswordRecoveryProvider } from "../../../src/contexts/PasswordRecoveryProvider";
import { usePasswordRecovery } from "../../../src/contexts/PasswordRecoveryContext";
import type { PasswordRecovery } from "../../../src/types/auth.types";
import { readPasswordRecovery } from "../../../src/lib/passwordRecoverySession";

import { passwordResetResponse } from "../../fixtures/password.fixture";

function RecoveryControls() {
    const {
        recovery,
        authorization,
        saveRecovery,
        renewResendCooldown,
        saveAuthorization,
        discardAuthorization,
        clearRecovery,
    } = usePasswordRecovery();
    const previous = useRef<PasswordRecovery | null>(null);
    const [accepted, setAccepted] = useState<boolean | null>(null);

    return (
        <div>
            <output aria-label="E-mail atual">{recovery?.email ?? "nenhum"}</output>
            <output aria-label="Autorização">{authorization?.resetToken ?? "nenhuma"}</output>
            <output aria-label="Resposta aceita">{String(accepted)}</output>
            <button
                onClick={() => {
                    saveRecovery("primeiro@email.com");
                }}
            >
                Primeiro e-mail
            </button>
            <button
                onClick={() => {
                    previous.current = recovery;
                    saveRecovery("segundo@email.com");
                }}
            >
                Outro e-mail
            </button>
            <button
                onClick={() => {
                    if (previous.current) renewResendCooldown(previous.current);
                }}
            >
                Reenvio antigo
            </button>
            <button
                onClick={() => {
                    if (previous.current)
                        setAccepted(saveAuthorization(previous.current, passwordResetResponse));
                }}
            >
                Autorização antiga
            </button>
            <button
                onClick={() => {
                    if (recovery) renewResendCooldown(recovery);
                }}
            >
                Reenvio atual
            </button>
            <button
                onClick={() => {
                    if (recovery) setAccepted(saveAuthorization(recovery, passwordResetResponse));
                }}
            >
                Autorizar atual
            </button>
            <button onClick={discardAuthorization}>Descartar autorização</button>
            <button onClick={clearRecovery}>Limpar recuperação</button>
        </div>
    );
}

function renderControls() {
    return render(
        <MemoryRouter>
            <Routes>
                <Route element={<PasswordRecoveryProvider />}>
                    <Route path="/" element={<RecoveryControls />} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

describe("PasswordRecoveryProvider", () => {
    afterEach(() => vi.restoreAllMocks());

    test("deve ignorar respostas antigas e limpar autorização ao substituir ou reenviar", async () => {
        const user = userEvent.setup();

        renderControls();

        await user.click(screen.getByRole("button", { name: "Primeiro e-mail" }));
        await user.click(screen.getByRole("button", { name: "Autorizar atual" }));

        expect(screen.getByLabelText("Autorização")).toHaveTextContent(
            passwordResetResponse.resetToken,
        );

        await user.click(screen.getByRole("button", { name: "Outro e-mail" }));

        const current = readPasswordRecovery();

        await user.click(screen.getByRole("button", { name: "Reenvio antigo" }));
        await user.click(screen.getByRole("button", { name: "Autorização antiga" }));

        expect(screen.getByLabelText("Resposta aceita")).toHaveTextContent("false");
        expect(screen.getByLabelText("Autorização")).toHaveTextContent("nenhuma");
        assert.deepEqual(readPasswordRecovery(), current);

        await user.click(screen.getByRole("button", { name: "Autorizar atual" }));
        await user.click(screen.getByRole("button", { name: "Reenvio atual" }));

        expect(screen.getByLabelText("Autorização")).toHaveTextContent("nenhuma");
        assert.deepEqual(readPasswordRecovery(), current);

        await user.click(screen.getByRole("button", { name: "Autorizar atual" }));
        await user.click(screen.getByRole("button", { name: "Descartar autorização" }));

        expect(screen.getByLabelText("Autorização")).toHaveTextContent("nenhuma");
        assert.deepEqual(readPasswordRecovery(), current);

        await user.click(screen.getByRole("button", { name: "Limpar recuperação" }));

        expect(screen.getByLabelText("E-mail atual")).toHaveTextContent("nenhum");
        assert.isNull(readPasswordRecovery());
    });

    test("deve preservar o cooldown do mesmo e-mail e renovar após o prazo", async () => {
        const user = userEvent.setup();

        renderControls();

        await user.click(screen.getByRole("button", { name: "Primeiro e-mail" }));

        const first = readPasswordRecovery()!;

        vi.spyOn(Date, "now").mockReturnValue(first.resendAvailableAt - 1000);

        await user.click(screen.getByRole("button", { name: "Primeiro e-mail" }));

        assert.equal(readPasswordRecovery()?.resendAvailableAt, first.resendAvailableAt);

        vi.spyOn(Date, "now").mockReturnValue(first.resendAvailableAt + 1);

        await user.click(screen.getByRole("button", { name: "Reenvio atual" }));

        assert.equal(readPasswordRecovery()?.resendAvailableAt, first.resendAvailableAt + 60_001);
    });
});
