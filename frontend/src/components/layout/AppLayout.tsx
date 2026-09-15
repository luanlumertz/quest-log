import { Outlet } from "react-router";

import { DesktopHeader } from "./DesktopHeader";
import { MobileNavigation } from "./MobileNavigation";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-backdrop text-ink">
            <DesktopHeader />

            <main className="pb-16 lg:pb-0">
                <Outlet />
            </main>

            <MobileNavigation />
        </div>
    );
}
