/// <reference types="vitest/config" />
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
    plugins: [sveltekit()],
    define: {
        __LIB_VERSION__: JSON.stringify(pkg.version),
    },
    test: {
        // Using jsdom, so window.dispatchEvent works in tests
        environment: "jsdom",
    },
});
