import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

import { RegistrationProvider } from "../../../src/contexts/RegistrationProvider";
import { useRegistration } from "../../../src/contexts/RegistrationContext";
import { readPendingRegistration } from "../../../src/lib/registrationSession";
import { registrationResponse } from "../../fixtures/registration.fixture";

const secondId = "22222222-2222-4222-8222-222222222222";

function RegistrationControls() {
    const {
        pending,
        draft,
        saveRegistration,
        setDraft,
        renewResendCooldown,
        discardPendingRegistration,
        clearRegistration,
    } = useRegistration();
    const data = { name: "João Silva", email: registrationResponse.email, password: "12345678" };

    return (
        <div>
            <output aria-label="Pendência">{pending?.pendingRegistrationId ?? "nenhuma"}</output>
            <output aria-label="Nome no formulário">{draft?.name ?? "vazio"}</output>
            <button
                onClick={() => {
                    setDraft({ ...data, confirmPassword: data.password });
                    saveRegistration(registrationResponse, data);
                }}
            >
                Primeira tentativa
            </button>
            <button
                onClick={() =>
                    saveRegistration(
                        { ...registrationResponse, pendingRegistrationId: secondId },
                        data,
                    )
                }
            >
                Nova tentativa
            </button>
            <button onClick={() => renewResendCooldown(registrationResponse.pendingRegistrationId)}>
                Reenvio antigo
            </button>
            <button
                onClick={() =>
                    discardPendingRegistration(registrationResponse.pendingRegistrationId)
                }
            >
                Falha antiga
            </button>
            <button onClick={() => renewResendCooldown(secondId)}>Reenvio atual</button>
            <button onClick={clearRegistration}>Limpar cadastro</button>
        </div>
    );
}

describe("RegistrationProvider", () => {
    afterEach(() => vi.restoreAllMocks());

    test("respostas atrasadas não devem sobrescrever ou limpar a nova tentativa", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Routes>
                    <Route element={<RegistrationProvider />}>
                        <Route path="/" element={<RegistrationControls />} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );

        await user.click(screen.getByRole("button", { name: "Reenvio antigo" }));

        expect(screen.getByLabelText("Pendência")).toHaveTextContent("nenhuma");

        await user.click(screen.getByRole("button", { name: "Primeira tentativa" }));
        await user.click(screen.getByRole("button", { name: "Nova tentativa" }));

        const current = readPendingRegistration();

        await user.click(screen.getByRole("button", { name: "Reenvio antigo" }));
        await user.click(screen.getByRole("button", { name: "Falha antiga" }));

        assert.deepEqual(readPendingRegistration(), current);
        expect(screen.getByLabelText("Pendência")).toHaveTextContent(secondId);

        vi.spyOn(Date, "now").mockReturnValue(Date.now() + 1000);

        await user.click(screen.getByRole("button", { name: "Reenvio atual" }));

        assert.isAbove(readPendingRegistration()!.resendAvailableAt, current!.resendAvailableAt);

        await user.click(screen.getByRole("button", { name: "Limpar cadastro" }));

        assert.isNull(readPendingRegistration());
        expect(screen.getByLabelText("Nome no formulário")).toHaveTextContent("vazio");
    });
});
