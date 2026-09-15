import { Link, NavLink } from "react-router";

import { Logo } from "../ui/Logo";
import { navigationItems } from "./navigationItems";
import { ProfileMenu } from "./ProfileMenu";

export function DesktopHeader() {
    return (
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

            <nav
                className="
                    absolute left-1/2
                    flex -translate-x-1/2
                    items-center gap-2
                "
            >
                {navigationItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
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
                            {item.icon}
                        </span>

                        {item.desktopLabel}
                    </NavLink>
                ))}
            </nav>

            <ProfileMenu />
        </header>
    );
}
