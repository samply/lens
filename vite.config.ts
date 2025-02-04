import { defineConfig, type PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { transform } from "esbuild";
import * as pkg from "./package.json";
import sveltePreprocess from "svelte-preprocess";
import dts from "vite-plugin-dts";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import * as fs from "fs";

const bundleComponents = process.env.BUNDLE_COMPONENTS ?? true;

export default defineConfig({
    root: "./packages/lib/",
    build: {
        outDir: "../../dist",
        lib: {
            entry: "./index.ts",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formats: bundleComponents ? (["es", "esm", "umd"] as any) : ["es"],
            name: pkg.name.replace(/-./g, (char) => char[1].toUpperCase()),
            fileName: (format): string => {
                const name = pkg.name.replace("@samply/", "");
                switch (format) {
                    case "es":
                        return `${name}.js`;
                    case "esm":
                        return `${name}.min.js`;
                    case "umd":
                        return `${name}.umd.js`;
                    default:
                        return name;
                }
            },
        },
        rollupOptions: {
            output: bundleComponents
                ? {}
                : {
                      inlineDynamicImports: false,
                      chunkFileNames: "[name].js",
                      manualChunks: { svelte: ["svelte"] },
                  },
        },
    },
    plugins: [
        svelte({
            preprocess: [sveltePreprocess({ typescript: true })],
            compilerOptions: {
                customElement: true,
            },
        }),
        dts({
            insertTypesEntry: true,
            include: ["**/types/*.ts"],
            afterBuild: afterBuild,
        }),
        minifyEs(),
    ],
});

/**
 * Workaround for https://github.com/vitejs/vite/issues/6555
 * Minify the es output
 * @returns the minifyEs plugin
 */
function minifyEs(): PluginOption {
    return {
        name: "minifyEs",
        renderChunk: {
            order: "post" as const,
            async handler(code, chunk, outputOptions) {
                if (
                    outputOptions.format === "es" &&
                    (!bundleComponents || chunk.fileName.endsWith(".min.js"))
                ) {
                    return await transform(code, { minify: true });
                }
                return code;
            },
        },
    };
}

/**
 * runs after the dts plugin has finished
 */
function afterBuild(): void {
    concatenateDeclarationFiles("./dist/src/types/");
}

/**
 * Concatenate all declaration files into a single file
 * @param folderPath the path where the declaration files are located
 */
function concatenateDeclarationFiles(folderPath: string): void {
    const declarationFiles = readdirSync(folderPath)
        .map((file) => readFileSync(`${folderPath}${file}`, "utf-8"))
        .join("\n");

    // Write the concatenated declaration files to a single file and remove the folder
    writeFileSync("./dist/types.d.ts", declarationFiles);
    removeImportLinesFromFile("./dist/types.d.ts");

    fs.rmSync("./dist/src", { recursive: true, force: true });
}

/**
 * removes all import statements from a file
 * @param filePath the path of the file
 */
function removeImportLinesFromFile(filePath: string): void {
    // Read the file content
    fs.readFile(
        filePath,
        "utf8",
        (err: NodeJS.ErrnoException | null, data: string) => {
            if (err) {
                console.error("Error reading file:", err);
                return;
            }

            // Split the content into lines
            const lines: string[] = data.split("\n");

            // Filter out lines starting with 'import'
            const filteredLines: string[] = lines.filter(
                (line) => !line.trim().startsWith("import"),
            );

            // Join the remaining lines
            const modifiedContent: string = filteredLines.join("\n");

            // Write the modified content back to the file
            fs.writeFile(
                filePath,
                modifiedContent,
                "utf8",
                (err: NodeJS.ErrnoException | null) => {
                    if (err) {
                        console.error("Error writing file:", err);
                        return;
                    }
                    console.log("File updated successfully.");
                },
            );
        },
    );
}
