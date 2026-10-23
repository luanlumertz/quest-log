import { describe, expect, test } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProtectedRoute } from "../../../src/routes/ProtectedRoute";
import { AuthContext, type AuthContextType } from "../../../src/contexts/AuthContext";
import { createAuthContextMock } from "../../mocks/authContext.mock";

function renderProtectedRoute(overrides: Partial<AuthContextType> = {}) {
    const authValue = createAuthContextMock({
        user: null,
        status: "unauthenticated",
        ...overrides,
    });

    render(
        <AuthContext.Provider value={authValue}>
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<div>Dashboard privado</div>} />
                    </Route>
                    <Route path="/login" element={<div>Página de login</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    );

    return { retryAuth: authValue.retryAuth };
}

describe("ProtectedRoute.tsx", () => {
    test("deve redirecionar usuários não autenticados para a página de login", async () => {
        renderProtectedRoute();

        expect(await screen.findByText("Página de login")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard privado")).not.toBeInTheDocument();
    });

    test("deve permitir acesso à rota privada para usuários autenticados", () => {
        renderProtectedRoute({
            status: "authenticated",
            user: { id: 1, name: "João Silva", email: "joao@email.com" },
        });

        expect(screen.getByText("Dashboard privado")).toBeVisible();
        expect(screen.queryByText("Página de login")).not.toBeInTheDocument();
    });

    test("deve aguardar a verificação da sessão sem exibir conteúdo privado nem redirecionar", () => {
        renderProtectedRoute({ status: "loading" });

        expect(screen.getByRole("status")).toHaveTextContent("Verificando sessão...");
        expect(screen.queryByText("Dashboard privado")).not.toBeInTheDocument();
        expect(screen.queryByText("Página de login")).not.toBeInTheDocument();
    });

    test("deve permitir tentar verificar a sessão novamente após um erro sem liberar a rota", async () => {
        const user = userEvent.setup();

        const { retryAuth } = renderProtectedRoute({ status: "error" });

        expect(screen.getByText("Não foi possível verificar sua sessão")).toBeVisible();
        expect(screen.queryByText("Dashboard privado")).not.toBeInTheDocument();
        expect(screen.queryByText("Página de login")).not.toBeInTheDocument();
        expect(retryAuth).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(retryAuth).toHaveBeenCalledTimes(1);
        expect(screen.queryByText("Dashboard privado")).not.toBeInTheDocument();
    });

    test("deve impedir acesso quando o status é autenticado mas o usuário está ausente", async () => {
        renderProtectedRoute({ status: "authenticated", user: null });

        expect(await screen.findByText("Página de login")).toBeVisible();
        expect(screen.queryByText("Dashboard privado")).not.toBeInTheDocument();
    });
});
