import type { MaterialIconName } from "../ui/MaterialIcon";

type NavigationItem = {
    to: string;
    icon: MaterialIconName;
    desktopLabel: string;
    mobileLabel: string;
};

export const navigationItems: NavigationItem[] = [
    {
        to: "/dashboard",
        icon: "dashboard",
        desktopLabel: "Visão Geral",
        mobileLabel: "Visão Geral",
    },
    {
        to: "/library",
        icon: "library_books",
        desktopLabel: "Biblioteca",
        mobileLabel: "Biblioteca",
    },
    {
        to: "/games/search",
        icon: "search",
        desktopLabel: "Procurar Jogos",
        mobileLabel: "Pesquisar",
    },
];
