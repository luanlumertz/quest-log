import type { ViewportMap } from "storybook/viewport";

export const layoutViewports = {
    mobile: {
        name: "Mobile (390px)",
        styles: { width: "390px", height: "844px" },
        type: "mobile",
    },
    desktop: {
        name: "Desktop (1440px)",
        styles: { width: "1440px", height: "900px" },
        type: "desktop",
    },
} satisfies ViewportMap;

export const demoNavigationPaths = [
    "/dashboard",
    "/library",
    "/games/search",
    "/profile",
    "/library?status=PLAYING",
    "/library/1",
];
