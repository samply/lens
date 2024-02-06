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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            exclude: /\.wc\.svelte$/ as any,
            hot: false,
        }),
        svelte({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            include: /\.wc\.svelte$/ as any,
            hot: false,
            compilerOptions: {
                customElement: true,
            },
        }),
    ],
});
