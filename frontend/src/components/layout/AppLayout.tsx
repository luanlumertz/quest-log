import { Outlet } from "react-router";

import { DesktopHeader } from "./DesktopHeader";
import { MobileNavigation } from "./MobileNavigation";
import { RawgAttribution } from "../ui/RawgAttribution";

export function AppLayout() {
    return (
        <div className="flex min-h-dvh flex-col bg-backdrop text-ink">
            <DesktopHeader />

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            <footer className="shrink-0 px-4 pb-22 text-center lg:pb-6">
                <RawgAttribution />
            </footer>

            <MobileNavigation />
        </div>
    );
}
