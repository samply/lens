import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    root: "./packages/demo/",
    resolve: {
        dedupe: ["svelte"],
    },
    build: {
        outDir: "../../dist/demo",
        emptyOutDir: true,
    },
    plugins: [
        svelte({
            hot: false,
            compilerOptions: {
                customElement: true,
            },
        }),
    ],
});
