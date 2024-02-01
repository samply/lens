module.exports = {
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:svelte/recommended',
      'plugin:svelte/prettier', 
      'prettier',
      'prettier/@typescript-eslint',
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
        parseOptions: {
            parser: '@typescript-eslint/parser',
        }
      }
    ],
    rules: {
      // Add any additional rules or overrides as needed
    },
    settings: {
      // Svelte configuration
      'svelte3/typescript': require('typescript'),
    },
  };