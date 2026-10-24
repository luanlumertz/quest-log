import { assert, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";

import { AddGameToLibraryModal } from "../../../../../src/components/game/add-game-modal/AddGameToLibraryModal";
import { API_URL } from "../../../../../src/services/api";

import { createTestQueryClient } from "../../../../helpers/createTestQueryClient.helper";
import { mockApiResponse } from "../../../../mocks/api.mock";
import { server } from "../../../../mocks/server.mock";
import { createGameDetails } from "../../../../fixtures/game.fixture";

const game = createGameDetails({
    title: "Test Game",
    platforms: ["Platform1", "Platform2"],
    releaseDate: "2020-01-01",
});

function renderAddGameModal(gameDetails = game) {
    const queryClient = createTestQueryClient();

    const onClose = vi.fn();

    render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <AddGameToLibraryModal game={gameDetails} isOpen={true} onClose={onClose} />
            </MemoryRouter>
        </QueryClientProvider>,
    );

    return { onClose };
}

describe("AddGameToLibraryModal.tsx", () => {
    test.each([
        { scenario: "sem plataformas na RAWG", platforms: [] },
        { scenario: "sem selecionar as plataformas disponíveis", platforms: ["PC"] },
    ])("deve adicionar um jogo pausado $scenario", async ({ platforms }) => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({ method: "POST", endpoint: "/library", status: 201 });

        const { onClose } = renderAddGameModal({ ...game, platforms });

        const submitButton = screen.getByRole("button", { name: "Adicionar à biblioteca" });

        expect(submitButton).toBeEnabled();

        await user.click(screen.getByRole("button", { name: "Pausado" }));
        await user.click(submitButton);

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        expect(requests).toHaveLength(1);
        expect(requests[0]?.body).toEqual({ externalId: 123, status: "PAUSED", platforms: [] });
    });

    test("deve adicionar um jogo à biblioteca com status e plataformas selecionados", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/library",
            status: 201,
        });

        const { onClose } = renderAddGameModal();

        const statusSelector = screen.getByRole("group", { name: "Status" });

        expect(
            within(statusSelector)
                .getAllByRole("button")
                .map((button) => button.textContent),
        ).toEqual(["Quero jogar", "Jogando", "Pausado", "Abandonado", "Zerado"]);

        await user.click(screen.getByRole("button", { name: "Platform1" }));
        await user.click(screen.getByRole("button", { name: "Jogando" }));
        await user.click(screen.getByRole("button", { name: "Adicionar à biblioteca" }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        assert.equal(requests.length, 1);
        assert.deepEqual(requests[0]?.body, {
            externalId: 123,
            status: "PLAYING",
            platforms: ["Platform1"],
        });
    });

    test("deve exibir o erro sem fechar o modal nem perder as seleções quando a adição falhar", async () => {
        const user = userEvent.setup();

        mockApiResponse({
            method: "POST",
            endpoint: "/library",
            status: 409,
            responseBody: { message: "Este jogo já está na biblioteca" },
        });

        const { onClose } = renderAddGameModal();

        await user.click(screen.getByRole("button", { name: "Platform1" }));
        await user.click(screen.getByRole("button", { name: "Jogando" }));
        await user.click(screen.getByRole("button", { name: "Adicionar à biblioteca" }));

        expect(await screen.findByText("Este jogo já está na biblioteca")).toBeVisible();
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "Platform1" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "Jogando" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "Adicionar à biblioteca" })).toBeEnabled();
    });

    test("deve impedir novo envio e fechamento enquanto a requisição está pendente", async () => {
        const user = userEvent.setup();

        let liberarResposta!: () => void;

        const respostaPendente = new Promise<void>((resolve) => {
            liberarResposta = resolve;
        });

        const registrarRequisicao = vi.fn();

        server.use(
            http.post(`${API_URL}/library`, async () => {
                registrarRequisicao();

                await respostaPendente;

                return HttpResponse.json({ ok: true }, { status: 201 });
            }),
        );

        const { onClose } = renderAddGameModal();

        await user.click(screen.getByRole("button", { name: "Platform1" }));
        await user.click(screen.getByRole("button", { name: "Adicionar à biblioteca" }));

        try {
            await waitFor(() => {
                expect(registrarRequisicao).toHaveBeenCalledTimes(1);
            });

            const botaoAdicionar = await screen.findByRole("button", {
                name: "Adicionando...",
            });

            expect(botaoAdicionar).toBeDisabled();

            await user.click(botaoAdicionar);

            expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();

            await user.keyboard("{Escape}");

            expect(onClose).not.toHaveBeenCalled();
        } finally {
            liberarResposta();
        }

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        expect(registrarRequisicao).toHaveBeenCalledTimes(1);
    });

    test("deve enviar apenas as plataformas que permanecerem selecionadas", async () => {
        const user = userEvent.setup();

        const { requests } = mockApiResponse({
            method: "POST",
            endpoint: "/library",
            status: 201,
        });

        const { onClose } = renderAddGameModal();

        await user.click(screen.getByRole("button", { name: "Platform1" }));
        await user.click(screen.getByRole("button", { name: "Platform2" }));
        await user.click(screen.getByRole("button", { name: "Platform1" }));
        await user.click(screen.getByRole("button", { name: "Adicionar à biblioteca" }));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        assert.equal(requests.length, 1);
        assert.deepEqual(requests[0]?.body, {
            externalId: 123,
            status: "WANT_TO_PLAY",
            platforms: ["Platform2"],
        });
    });
});
