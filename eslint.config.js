import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import svelte from "eslint-plugin-svelte";
import svelteConfig from "./svelte.config.js";

export default defineConfig([
    globalIgnores(["dist", "book/book"]),
    // Recommended JavaScript and TypeScript lints
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    // Configure ESLint for use with Svelte, see https://github.com/sveltejs/eslint-plugin-svelte#typescript-project
    ...svelte.configs.recommended,
    { languageOptions: { globals: globals.browser } },
    {
        files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                extraFileExtensions: [".svelte"],
                parser: tseslint.parser,
                svelteConfig,
            },
        },
    },
    // Turn off lints that conflict with Prettier, see https://github.com/prettier/eslint-config-prettier#installation
    eslintConfigPrettier,
]);
