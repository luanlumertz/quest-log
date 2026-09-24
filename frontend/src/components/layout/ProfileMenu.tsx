import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../../contexts/AuthContext";
import { getUserInitials } from "../../utils/getUserInitials";

export function ProfileMenu() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const { user, signOut } = useAuth();

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

    return (
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

                <span
                    className={`
                        -m-1 shrink-0
                        text-2xl text-ink-mute
                        transition-transform duration-200
                        ${isProfileOpen ? "rotate-180" : ""}
                    `}
                >
                    ▾
                </span>
            </button>

            <div
                className={`
                    absolute right-0 top-[calc(100%+8px)]
                    z-50
                    w-47.5
                    overflow-hidden
                    rounded-xl
                    border border-divider
                  bg-surface-raised
                    origin-top-right
                    transition-all duration-200 ease-out
                    ${isProfileOpen
                        ? "visible translate-y-0 scale-100 opacity-100"
                        : "invisible -translate-y-1 scale-95 opacity-0"
                    }
                `}
            >
                <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="
                        flex items-center gap-1.5
                        border-b border-divider
                        px-4 py-3
                      text-ink-dim
                        transition-colors
                      hover:bg-surface-hover
                      hover:text-ink
                    "
                >
                    <span className="material-symbols-rounded">
                        person
                    </span>

                    <span>Perfil</span>
                </Link>

                <button
                    onClick={signOut}
                    type="button"
                    className="
                        flex w-full items-center gap-1.5
                        px-4 py-3
                        text-left text-danger
                        transition-colors
                      hover:bg-surface-hover
                        cursor-pointer
                    "
                >
                    <span className="material-symbols-rounded">
                        logout
                    </span>

                    <span>Sair</span>
                </button>
            </div>

        </div>
    );
}
