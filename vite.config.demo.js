import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    plugins: [svelte()],
    build: {
        outDir: "demo-dist",
        rollupOptions: {
            input: "index.html", // entry HTML with <script> loading dev.svelte
        },
    },
});
