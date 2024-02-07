module.exports = {
    plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-tsdoc', 'jsdoc'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:svelte/recommended',
      'plugin:svelte/prettier', 
      'eslint-config-prettier',
      'prettier',
      "plugin:jsdoc/recommended-typescript-error",
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte'],
    },
    overrides: [
      {
        files: ['*.svelte'],
        parser: 'svelte-eslint-parser',
        parserOptions: {
            parser: '@typescript-eslint/parser',
        }
      }
    ],
    settings: {
      'svelte/typescript': import('typescript'),
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      'svelte/no-at-html-tags': 'off',
      'jsdoc/check-syntax': 2,
      "jsdoc/check-param-names": 2,


    },
    ignorePatterns: ['**/dist/**'],
  };