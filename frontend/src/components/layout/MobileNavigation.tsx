import { NavLink } from "react-router";

import { navigationItems } from "./navigationItems";

export function MobileNavigation() {
    return (
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
            {navigationItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `
                            flex flex-col
                            items-center justify-center
                            gap-1
                            text-[10px] font-medium
                            ${isActive
                            ? "text-brand"
                            : "text-ink-mute"
                        }`
                    }
                >
                    <span className="material-symbols-rounded text-[21px]!">
                        {item.icon}
                    </span>

                    <span>
                        {item.mobileLabel}
                    </span>
                </NavLink>
            ))}

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
    );
}
