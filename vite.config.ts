import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: "packages/lib/src/index.ts",
            // Only emit ESM, no CommonJS
            formats: ["es"],
        },
    },
    plugins: [
        svelte(),
        dts({
            // Emit type definitions as a single lens.d.ts file
            rollupTypes: true,
        }),
    ],
});
