import type { ReactNode } from "react";

type AuthLayoutProps = {
    children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-backdrop text-ink lg:grid lg:grid-cols-[3fr_2fr]">

            {/* Lado esquerdo - Desktop */}
            <aside
                className="
                    relative hidden min-h-screen overflow-hidden
                    bg-[url('/images/auth-bg.jpg')]
                    bg-cover bg-center
                    lg:flex lg:flex-col lg:justify-end
                    px-12 py-16
                "
            >
                <div className="absolute inset-0 bg-linear-to-b from-backdrop/55 via-backdrop/65 to-backdrop" />

                <div className="relative z-10 max-w-xl">
                    <Brand />

                    <h2 className="mt-8 max-w-md font-display text-4xl font-bold leading-tight text-white">
                        Every game is a story
                        <br />
                        worth remembering.
                    </h2>

                    <p className="mt-4 text-lg text-ink-dim">
                        Track your backlog. Rate what you play. Own your journey.
                    </p>
                </div>
            </aside>

            {/* Área do formulário */}
            <main
                className="
                    relative flex min-h-screen
                    items-center justify-center
                    overflow-hidden
                    px-6 py-10
                    sm:px-10
                    lg:px-16
                "
            >
                {/* Background apenas no mobile */}
                <div
                    className="
                        absolute inset-0
                        bg-[url('/images/auth-bg.jpg')]
                        bg-cover bg-center
                        opacity-40
                        lg:hidden
                    "
                />

                <div className="absolute inset-0 bg-backdrop/60 lg:bg-backdrop" />

                <div className="relative z-10 w-full max-w-md">

                    {/* No desktop a marca já aparece do lado esquerdo */}
                    <div className="mb-12 lg:hidden">
                        <Brand />
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}

function Brand() {
    return (
        <div className="flex items-center gap-3">
            <div
                className="
                    flex size-12 items-center justify-center
                    rounded-xl bg-brand
                    text-white
                "
            >
                <span className="material-symbols-rounded text-white text-[32px]!">
                    stadia_controller
                </span>
            </div>

            <span className="font-display text-2xl font-bold text-white">
                QuestLog
            </span>
        </div>
    );
}