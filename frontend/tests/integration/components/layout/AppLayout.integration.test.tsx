import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, test, vi } from "vitest";

import { AppLayout } from "../../../../src/components/layout/AppLayout";
import { AuthContext, type AuthContextType } from "../../../../src/contexts/AuthContext";
import { createAuthContextMock } from "../../../mocks/authContext.mock";

function renderAppLayout(overrides: Partial<AuthContextType> = {}) {
    const authValue = createAuthContextMock({
        user: { id: 1, name: "João Silva", email: "joao@email.com" },
        status: "authenticated",
        ...overrides,
    });

    render(
        <AuthContext.Provider value={authValue}>
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<AppLayout />}>
                        <Route path="/dashboard" element={<h1>Dashboard de teste</h1>} />
                        <Route path="/library" element={<h1>Biblioteca de teste</h1>} />
                        <Route path="/games/search" element={<h1>Busca de teste</h1>} />
                        <Route path="/profile" element={<h1>Perfil de teste</h1>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    );

    const header = screen.getByRole("banner");

    const desktopNavigation = within(header).getByRole("navigation");
    const mobileNavigation = screen
        .getAllByRole("navigation")
        .find((navigation) => !header.contains(navigation));

    if (!mobileNavigation) throw new Error("Navegação mobile não encontrada");

    return {
        desktopNavigation,
        mobileNavigation,
        profileTrigger: within(header).getByRole("button", { name: /João Silva/ }),
        signOut: authValue.signOut,
    };
}

describe("AppLayout.tsx", () => {
    test("deve exibir a atribuição da RAWG no rodapé com link para uma nova aba", () => {
        renderAppLayout();

        const footer = within(screen.getByRole("contentinfo"));
        const link = footer.getByRole("link", { name: "RAWG" });

        expect(link).toBeVisible();
        expect(link).toHaveAttribute("href", "https://rawg.io/");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link.getAttribute("rel")?.split(/\s+/)).toEqual(
            expect.arrayContaining(["noopener", "noreferrer"]),
        );
    });

    test("deve renderizar as rotas filhas e navegar pelo cabeçalho com indicação da página ativa", async () => {
        const user = userEvent.setup();

        const { desktopNavigation } = renderAppLayout();

        const nav = within(desktopNavigation);

        expect(
            within(screen.getByRole("main")).getByRole("heading", { name: "Dashboard de teste" }),
        ).toBeVisible();
        expect(nav.getByRole("link", { name: "Visão Geral" })).toHaveAttribute(
            "aria-current",
            "page",
        );

        await user.click(nav.getByRole("link", { name: "Biblioteca" }));

        expect(await screen.findByRole("heading", { name: "Biblioteca de teste" })).toBeVisible();
        expect(nav.getByRole("link", { name: "Biblioteca" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        expect(nav.getByRole("link", { name: "Visão Geral" })).not.toHaveAttribute("aria-current");

        await user.click(nav.getByRole("link", { name: "Procurar Jogos" }));

        expect(await screen.findByRole("heading", { name: "Busca de teste" })).toBeVisible();
        expect(nav.getByRole("link", { name: "Procurar Jogos" })).toHaveAttribute(
            "aria-current",
            "page",
        );

        await user.click(nav.getByRole("link", { name: "Visão Geral" }));

        expect(await screen.findByRole("heading", { name: "Dashboard de teste" })).toBeVisible();
    });

    test("deve navegar pelas opções mobile e marcar a rota selecionada", async () => {
        const user = userEvent.setup();

        const { mobileNavigation } = renderAppLayout();

        const nav = within(mobileNavigation);
        const destinations = [
            { label: "Biblioteca", heading: "Biblioteca de teste" },
            { label: "Pesquisar", heading: "Busca de teste" },
            { label: "Perfil", heading: "Perfil de teste" },
            { label: "Visão Geral", heading: "Dashboard de teste" },
        ];

        for (const destination of destinations) {
            await user.click(nav.getByRole("link", { name: destination.label }));

            expect(await screen.findByRole("heading", { name: destination.heading })).toBeVisible();
            expect(nav.getByRole("link", { name: destination.label })).toHaveAttribute(
                "aria-current",
                "page",
            );
        }
    });

    test("deve fechar o menu com Escape restaurando o foco e ao clicar fora", async () => {
        const user = userEvent.setup();

        const { profileTrigger } = renderAppLayout();

        expect(profileTrigger).toHaveAttribute("aria-expanded", "false");

        await user.click(profileTrigger);

        expect(profileTrigger).toHaveAttribute("aria-expanded", "true");

        await user.tab();
        await user.keyboard("{Escape}");

        expect(profileTrigger).toHaveAttribute("aria-expanded", "false");
        expect(profileTrigger).toHaveFocus();

        await user.click(profileTrigger);

        expect(profileTrigger).toHaveAttribute("aria-expanded", "true");

        await user.click(screen.getByRole("heading", { name: "Dashboard de teste" }));

        expect(profileTrigger).toHaveAttribute("aria-expanded", "false");
    });

    test("deve acessar o perfil pelo menu e fechá-lo após a navegação", async () => {
        const user = userEvent.setup();

        const { profileTrigger } = renderAppLayout();

        await user.click(profileTrigger);

        const header = within(screen.getByRole("banner"));

        await user.click(header.getByRole("link", { name: "Perfil" }));

        expect(await screen.findByRole("heading", { name: "Perfil de teste" })).toBeVisible();
        expect(profileTrigger).toHaveAttribute("aria-expanded", "false");
    });

    test("deve bloquear novo logout durante o envio e fechar o menu após sucesso", async () => {
        const user = userEvent.setup();

        let finalizarLogout!: () => void;
        const pendingLogout = new Promise<void>((resolve) => {
            finalizarLogout = resolve;
        });

        const signOut = vi.fn(() => pendingLogout);

        const { profileTrigger } = renderAppLayout({ signOut });

        await user.click(profileTrigger);

        try {
            await user.click(screen.getByRole("button", { name: "Sair" }));

            const sair = await screen.findByRole("button", { name: "Saindo..." });

            expect(sair).toBeDisabled();

            await user.click(sair);

            expect(signOut).toHaveBeenCalledTimes(1);
            expect(profileTrigger).toHaveAttribute("aria-expanded", "true");
        } finally {
            finalizarLogout();
        }

        await waitFor(() => expect(profileTrigger).toHaveAttribute("aria-expanded", "false"));

        expect(signOut).toHaveBeenCalledTimes(1);
    });

    test("deve preservar o menu aberto após falha no logout e permitir nova tentativa", async () => {
        const user = userEvent.setup();

        const signOut = vi
            .fn<() => Promise<void>>()
            .mockRejectedValueOnce(new Error("Falha temporária"))
            .mockResolvedValueOnce(undefined);

        const { profileTrigger } = renderAppLayout({ signOut });

        await user.click(profileTrigger);
        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByText("Não foi possível encerrar a sessão.")).toBeVisible();
        expect(profileTrigger).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("button", { name: "Sair" })).toBeEnabled();

        await user.click(screen.getByRole("button", { name: "Sair" }));

        await waitFor(() => expect(profileTrigger).toHaveAttribute("aria-expanded", "false"));

        expect(screen.queryByText("Não foi possível encerrar a sessão.")).not.toBeInTheDocument();
        expect(signOut).toHaveBeenCalledTimes(2);
    });
});
