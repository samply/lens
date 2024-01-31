import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { transform } from 'esbuild';
import pkg from './package.json';
import sveltePreprocess from 'svelte-preprocess';
import dts from 'vite-plugin-dts';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import * as fs from 'fs';

const bundleComponents = process.env.BUNDLE_COMPONENTS ?? true;


export default defineConfig({
  root: './packages/lib/',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    lib: {
      entry: './index.ts',
      formats: bundleComponents ? ['es', 'esm', 'umd'] as any : ['es'],
      name: pkg.name.replace(/-./g, (char) => char[1].toUpperCase()),
      fileName: (format) => ({
        es: `${pkg.name}.js`,
        esm: `${pkg.name}.min.js`,
        umd: `${pkg.name}.umd.js`,
      })[format]
    },
    rollupOptions: {
      output: bundleComponents ? {} : {
        inlineDynamicImports: false,
        chunkFileNames: "[name].js",
        manualChunks: { 'svelte': ["svelte"] }
      }
    },
  },
  plugins: [
    svelte({
      preprocess: [sveltePreprocess({ typescript: true })],
      compilerOptions: {
        customElement: true
      }
    }),
    dts({
      insertTypesEntry: true,
      outDir: "../../dist",
      include: ["**/types/*.ts"],
      afterBuild: afterBuild
    }),
    minifyEs()
  ]
});

// Workaround for https://github.com/vitejs/vite/issues/6555
function minifyEs() {
  return {
    name: 'minifyEs',
    renderChunk: {
      order: 'post' as const,
      async handler(code, chunk, outputOptions) {
        if (outputOptions.format === 'es' && (!bundleComponents || chunk.fileName.endsWith('.min.js'))) {
          return await transform(code, { minify: true });
        }
        return code;
      },
    }
  };
}

/**
 * runs after the dts plugin has finished
 */
function afterBuild() :void {
  concatenateDeclarationFiles('./dist/src/types/');
  /**
   * Building somehow adds another @samply folder to the dist folder so this workaround is needed
   * to move the files to the root of the dist folder and delete the unnecessary folder
   */
  restructureDirectory('./dist/@samply/');
}

/**
 * Concatenate all declaration files into a single file
 * @param folderPath the path where the declaration files are located
 */
function concatenateDeclarationFiles(folderPath: string): void {
  const declarationFiles = readdirSync(folderPath)
    .map((file) => readFileSync(`${folderPath}${file}`, 'utf-8'))
    .join('\n');

  // Write the concatenated declaration files to a single file and remove the folder
  writeFileSync('./dist/types.d.ts', declarationFiles);
  fs.rmSync('./dist/src', { recursive: true, force: true });
}


/**
 * Restructure the directory to match the npm package structure
 * this removes the @samply folder and moves the files to the root of the dist folder
 * @param path the path where the files are located
 */
async function restructureDirectory(path: string) {
  moveFile(`${path}lens.js`, "./dist/lens.js");
  moveFile(`${path}lens.min.js`, "./dist/lens.min.js");
  moveFile(`${path}lens.umd.js`, "./dist/lens.umd.js");
}

/**
 * Moves a file from the oldFile to the target
 * Removes the @samply folder if it is empty
 * @param oldFile the path of the old file
 * @param target the path of the target file
 */
function moveFile(oldFile: string, target: string): void {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (fs.readFileSync(oldFile, 'utf-8').length > 0) {
      fs.renameSync(oldFile, target);
      clearInterval(interval);
    } else if (attempts > 10) {
      throw new Error('File not found');
      clearInterval(interval);
    }
    if(fs.readdirSync('./dist/@samply/').length === 0) {
      fs.rmSync('./dist/@samply/', { recursive: true, force: true });
    }
  }, 1000);
}
