import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, test } from "vitest";

import { AuthContext, type AuthContextType } from "../../../src/contexts/AuthContext";
import { PublicRoute } from "../../../src/routes/PublicRoute";
import { createAuthContextMock } from "../../mocks/authContext.mock";

function renderPublicRoute(overrides: Partial<AuthContextType> = {}) {
    const authValue = createAuthContextMock({
        user: null,
        status: "unauthenticated",
        ...overrides,
    });

    render(
        <AuthContext.Provider value={authValue}>
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<div>Login de teste</div>} />
                    </Route>
                    <Route path="/dashboard" element={<div>Dashboard de teste</div>} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    );

    return { retryAuth: authValue.retryAuth };
}

describe("PublicRoute.tsx", () => {
    test("deve permitir acesso à rota pública quando não há sessão autenticada", () => {
        renderPublicRoute();

        expect(screen.getByText("Login de teste")).toBeVisible();
        expect(screen.queryByText("Dashboard de teste")).not.toBeInTheDocument();
    });

    test("deve redirecionar usuários autenticados para o dashboard", async () => {
        renderPublicRoute({
            status: "authenticated",
            user: { id: 1, name: "João Silva", email: "joao@email.com" },
        });

        expect(await screen.findByText("Dashboard de teste")).toBeVisible();
        expect(screen.queryByText("Login de teste")).not.toBeInTheDocument();
    });

    test("deve aguardar a sessão sem mostrar login nem redirecionar", () => {
        renderPublicRoute({ status: "loading" });

        expect(screen.getByRole("status")).toHaveTextContent("Verificando sessão...");
        expect(screen.queryByText("Login de teste")).not.toBeInTheDocument();
        expect(screen.queryByText("Dashboard de teste")).not.toBeInTheDocument();
    });

    test("deve apresentar erro e permitir nova verificação sem liberar a rota pública", async () => {
        const user = userEvent.setup();

        const { retryAuth } = renderPublicRoute({ status: "error" });

        expect(screen.getByText("Não foi possível verificar sua sessão")).toBeVisible();
        expect(screen.queryByText("Login de teste")).not.toBeInTheDocument();
        expect(screen.queryByText("Dashboard de teste")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

        expect(retryAuth).toHaveBeenCalledTimes(1);
    });
});
