import type { StorybookConfig } from "@storybook/react-vite";
import { MATERIAL_ICON_NAMES } from "../src/components/ui/materialIcon.config.js";

const config: StorybookConfig = {
    framework: "@storybook/react-vite",
    stories: ["../stories/**/*.stories.@(ts|tsx)", "../stories/**/*.mdx"],
    addons: ["@storybook/addon-docs"],
    staticDirs: ["../public"],
    previewHead: (head) => `${head}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght@200&amp;icon_names=${MATERIAL_ICON_NAMES.join(",")}&amp;display=block" />
    `,
};

export default config;
