import { Outlet } from "react-router";

import { DesktopHeader } from "./DesktopHeader";
import { MobileNavigation } from "./MobileNavigation";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-backdrop text-ink">
            <DesktopHeader />

            <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-0">
                <Outlet />
            </main>

            <MobileNavigation />
        </div>
    );
}
