import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../../contexts/AuthContext";
import { getUserInitials } from "../../utils/getUserInitials";
import { MaterialIcon } from "../ui/MaterialIcon";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Alert } from "../ui/Alert";

export function ProfileMenu() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const { user, signOut } = useAuth();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || !isProfileOpen) {
                return;
            }

            setIsProfileOpen(false);

            triggerRef.current?.focus();
        }

        document.addEventListener("mousedown", handleClickOutside);

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);

            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isProfileOpen]);

    async function handleLogout() {
        setLogoutError("");
        setIsLoggingOut(true);

        try {
            await signOut();

            setIsProfileOpen(false);
        } catch (error) {
            setLogoutError(
                getErrorMessage(
                    error,
                    "Não foi possível encerrar a sessão."
                )
            );
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <div ref={profileRef} className="relative ml-auto">
            <button
                ref={triggerRef}
                type="button"
                aria-expanded={isProfileOpen}
                aria-controls="profile-menu"
                onClick={() => setIsProfileOpen((current) => !current)}
                className="
                    flex h-12 w-fit
                    items-center gap-3
                    rounded-xl px-4
                  text-ink-dim
                    transition-colors
                  hover:bg-surface-raised
                    hover:cursor-pointer
                  hover:text-ink
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
                    aria-hidden="true"
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
                id="profile-menu"
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
                    <MaterialIcon
                        name="person"
                    />

                    <span>Perfil</span>
                </Link>

                <button
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    type="button"
                    className="
                        flex w-full items-center gap-1.5
                        px-4 py-3
                        text-left text-danger
                        transition-colors
                      hover:bg-surface-hover
                        cursor-pointer
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <MaterialIcon
                        name="logout"
                    />

                    <span>
                        {isLoggingOut ? "Saindo..." : "Sair"}
                    </span>
                </button>

                {logoutError && (
                    <div className="border-t border-divider p-2">
                        <Alert>
                            {logoutError}
                        </Alert>
                    </div>
                )}
            </div>

        </div>
    );
}
