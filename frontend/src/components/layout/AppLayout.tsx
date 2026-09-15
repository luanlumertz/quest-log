import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet } from "react-router";

import { Logo } from "../ui/Logo";
import { useAuth } from "../../contexts/AuthContext";

export function AppLayout() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setIsProfileOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function getUserInitials(name: string) {
        const names = name.trim().split(/\s+/);

        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }

        const firstInitial = names[0].charAt(0);
        const lastInitial = names[names.length - 1].charAt(0);

        return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    return (
        <div className="min-h-screen bg-backdrop text-ink">

            {/* DESKTOP */}
            <header
                className="
                    relative hidden h-17
                    items-center
                    border-b border-divider
                    px-6
                    lg:flex
                "
            >
                <Link to="/">
                    <Logo />
                </Link>

                {/* Navegação central */}
                <nav
                    className="
                        absolute left-1/2
                        flex -translate-x-1/2
                        items-center gap-2
                    "
                >
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `
                                flex items-center gap-2
                                rounded-xl px-5 py-2.5
                                font-medium
                                transition-colors
                                ${isActive
                                ? "bg-brand/15 text-brand"
                                : "text-ink-dim hover:text-ink"
                            }
                            `
                        }
                    >
                        <span className="material-symbols-rounded text-[22px]!">
                            dashboard
                        </span>

                        Visão Geral
                    </NavLink>

                    <NavLink
                        to="/library"
                        className={({ isActive }) =>
                            `
                                flex items-center gap-2
                                rounded-xl px-5 py-2.5
                                font-medium
                                transition-colors
                                ${isActive
                                ? "bg-brand/15 text-brand"
                                : "text-ink-dim hover:text-ink"
                            }
                            `
                        }
                    >
                        <span className="material-symbols-rounded text-[22px]!">
                            library_books
                        </span>

                        Biblioteca
                    </NavLink>

                    <NavLink
                        to="/games/search"
                        className={({ isActive }) =>
                            `
                                flex items-center gap-2
                                rounded-xl px-5 py-2.5
                                font-medium
                                transition-colors
                                ${isActive
                                ? "bg-brand/15 text-brand"
                                : "text-ink-dim hover:text-ink"
                            }
                            `
                        }
                    >
                        <span className="material-symbols-rounded text-[22px]!">
                            search
                        </span>

                        Procurar Jogos
                    </NavLink>
                </nav>

                {/* Perfil */}
                <div ref={profileRef} className="relative ml-auto">
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="
                            flex h-12 w-fit
                            items-center gap-3
                            rounded-xl
                            px-4
                          text-ink-dim
                            transition-colors
                          hover:bg-surface-raised
                            hover:cursor-pointer
                        "
                    >
                        <span
                            className="
                                flex size-8 shrink-0
                                items-center justify-center
                                rounded-full
                              bg-brand/25
                              text-brand
                            "
                        >
                            <span className="font-semibold">
                                {user?.name ? getUserInitials(user.name) : "U"}
                            </span>
                        </span>

                        <span className="max-w-32 truncate text-left">
                            {user?.name}
                        </span>

                        <span className={`shrink-0 text-ink-mute text-2xl -m-1 ${isProfileOpen ? "rotate-180" : ""} transition-all`}>
                            ▾
                        </span>
                    </button>

                    {isProfileOpen && (
                        <div
                            className="
                                absolute right-0 top-[calc(100%+8px)]
                                z-50
                                w-47.5
                                overflow-hidden
                                rounded-xl
                                border border-divider
                                bg-surface-raised
                            "
                        >
                            <Link
                                to="/profile"
                                onClick={() => setIsProfileOpen(false)}
                                className="
                                    block
                                    border-b border-divider
                                    px-5 py-3.5
                                    text-ink-dim
                                    transition-colors
                                    hover:bg-surface-hover
                                    hover:text-ink
                                "
                            >
                                Perfil
                            </Link>

                            <button
                                type="button"
                                className="
                                    w-full
                                    px-5 py-3.5
                                    text-left text-danger
                                    transition-colors
                                    hover:bg-surface-hover
                                "
                            >
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </header>


            {/* CONTEÚDO DA PÁGINA */}
            <main className="pb-16 lg:pb-0">
                <Outlet />
            </main>


            {/* MOBILE */}
            <nav
                className="
                    fixed inset-x-0 bottom-0
                    z-50
                    grid h-16 grid-cols-4
                    border-t border-divider
                    bg-surface
                    lg:hidden
                "
            >
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `
                            flex flex-col
                            items-center justify-center
                            gap-1
                            text-[10px] font-medium
                            ${isActive
                            ? "text-brand"
                            : "text-ink-mute"
                        }
                        `
                    }
                >
                    <span className="material-symbols-rounded text-[21px]!">
                        dashboard
                    </span>

                    <span>Visão Geral</span>
                </NavLink>

                <NavLink
                    to="/library"
                    className={({ isActive }) =>
                        `
                            flex flex-col
                            items-center justify-center
                            gap-1
                            text-[10px] font-medium
                            ${isActive
                            ? "text-brand"
                            : "text-ink-mute"
                        }
                        `
                    }
                >
                    <span className="material-symbols-rounded text-[21px]!">
                        library_books
                    </span>

                    <span>Biblioteca</span>
                </NavLink>

                <NavLink
                    to="/games/search"
                    className={({ isActive }) =>
                        `
                            flex flex-col
                            items-center justify-center
                            gap-1
                            text-[10px] font-medium
                            ${isActive
                            ? "text-brand"
                            : "text-ink-mute"
                        }
                        `
                    }
                >
                    <span className="material-symbols-rounded text-[21px]!">
                        search
                    </span>

                    <span>Pesquisar</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `
                            flex flex-col
                            items-center justify-center
                            gap-1
                            text-[10px] font-medium
                            ${isActive
                            ? "text-brand"
                            : "text-ink-mute"
                        }
                        `
                    }
                >
                    <span className="material-symbols-rounded text-[21px]!">
                        person
                    </span>

                    <span>Perfil</span>
                </NavLink>
            </nav>

        </div>
    );
}