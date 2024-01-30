import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { transform } from 'esbuild';
import pkg from './package.json';
import sveltePreprocess from 'svelte-preprocess';
import dts from 'vite-plugin-dts';
import { readdirSync, readFileSync, writeFileSync } from 'fs';


const bundleComponents = true //process.env.BUNDLE_COMPONENTS ?? true;

// Function to concatenate declaration files into one
function concatenateDeclarationFiles() {
  const declarationFiles = readdirSync('./dist/lib/src/types')
    .map((file) => readFileSync(`./dist/lib/src/types/${file}`, 'utf-8'))
    .join('\n');

  // Write the concatenated declaration files to a single file
  writeFileSync('./dist/lib/svelte-web-components.d.ts', declarationFiles);
}

export default defineConfig({
  root: './packages/lib/',
  build: {
    outDir: '../../dist/lib',
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

      // insertTypesEntry: true,
      include: ["**/types/*.ts"],
      afterBuild: () => concatenateDeclarationFiles()
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
