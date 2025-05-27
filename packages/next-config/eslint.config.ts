import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { type Linter } from 'eslint';

import baseConfig from '@repo/eslint-config/next';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: Linter.FlatConfig[] = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
];

export default config;
