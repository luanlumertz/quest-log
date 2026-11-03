import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../../src/contexts/AuthContext";
import type { User } from "../../src/types/auth.types";
import { navigationItems } from "../../src/components/layout/navigationItems";
import { StateView } from "../../src/components/ui/StateView";
import { Button } from "../../src/components/ui/Button";
import { ProfileDemo } from "./ProfileDemo";

export type NavigationDemoArgs = { user: User; initialPath: string };

function LayoutSession({ children, initialUser }: { children: ReactNode; initialUser: User }) {
    const { user, setUser } = useAuth();
    if (!user)
        return (
            <div className="min-h-dvh bg-backdrop p-6">
                <StateView
                    icon="check_circle"
                    title="Sessão fictícia encerrada"
                    description="A navegação deste exemplo foi encerrada. Nenhuma sessão real foi alterada."
                    action={
                        <Button onClick={() => setUser({ ...initialUser })}>
                            Reiniciar demonstração
                        </Button>
                    }
                />
            </div>
        );
    return children;
}

export function LayoutDemo({
    children,
    user,
    initialPath,
}: NavigationDemoArgs & { children: ReactNode }) {
    return (
        <ProfileDemo
            key={JSON.stringify([user, initialPath])}
            initialUser={user}
            initialPath={initialPath}
        >
            <LayoutSession initialUser={user}>{children}</LayoutSession>
        </ProfileDemo>
    );
}

export function NavigationDemoPage({ longContent = false }: { longContent?: boolean }) {
    const location = useLocation();
    const title =
        location.pathname === "/profile"
            ? "Perfil"
            : (navigationItems.find(
                  (item) =>
                      location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
              )?.desktopLabel ?? "Página ilustrativa");

    return (
        <section className="py-8">
            <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
                Página ilustrativa para experimentar a navegação em memória. Os links alteram a rota
                deste exemplo, sem abrir as telas da aplicação ou consultar a API.
            </p>
            {longContent &&
                Array.from({ length: 12 }, (_, index) => (
                    <div
                        key={index}
                        className="mt-5 rounded-xl border border-divider bg-surface p-5"
                    >
                        <h2 className="font-semibold text-ink">Seção {index + 1}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                            Conteúdo ilustrativo para conferir a rolagem, o posicionamento do rodapé
                            e a barra de navegação mobile durante a leitura.
                        </p>
                    </div>
                ))}
        </section>
    );
}
