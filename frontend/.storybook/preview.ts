import type { Preview } from "@storybook/react-vite";
import { themes } from "storybook/theming";
import { sb } from "storybook/test";
import "../src/index.css";

// Somente no catálogo: operações de biblioteca e conta usam serviços simulados.
sb.mock(import("../src/services/library.service.ts"));
sb.mock(import("../src/services/auth.service.ts"));

const preview: Preview = {
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: { theme: themes.dark },
        backgrounds: {
            options: {
                questlog: { name: "QuestLog", value: "#0b0d13" },
            },
        },
    },
    initialGlobals: {
        backgrounds: { value: "questlog" },
    },
};

export default preview;
