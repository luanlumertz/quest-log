import type { Preview } from "@storybook/react-vite";
import { themes } from "storybook/theming";
import "../src/index.css";

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
