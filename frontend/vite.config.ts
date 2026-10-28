import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/api": {
                target: process.env.E2E_BACKEND_URL ?? "http://localhost:3000",
                rewrite: (path) => path.replace(/^\/api/, ""),
                configure: (proxy) => {
                    proxy.on("proxyReq", (request) => {
                        if (process.env.ORIGIN_SECRET) {
                            request.setHeader(
                                "X-QuestLog-Origin-Secret",
                                process.env.ORIGIN_SECRET,
                            );
                        }
                    });
                },
            },
        },
    },
});
