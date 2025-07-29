import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            // Only emit ESM, no CommonJS
            formats: ["es"],
        },
        // Also emit source map as lens.js.map
        sourcemap: true,
    },
    plugins: [
        svelte(),
        dts({
            // Emit type definitions as a single lens.d.ts file
            rollupTypes: true,
        }),
    ],
    test: {
        // Using jsdom, so window.dispatchEvent works in tests
        environment: "jsdom",
    },
});
