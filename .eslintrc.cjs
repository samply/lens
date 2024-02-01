module.exports = {
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:svelte/recommended',
      'plugin:svelte/prettier', 
      'eslint-config-prettier',
      'prettier',
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
  };