// @ts-ignore - eslint-plugin-node doesn't have type definitions
import nodePlugin from 'eslint-plugin-node';
import globals from 'globals';

// server.ts
import baseConfig from './index.js';

import type { Linter } from 'eslint';

/*
 * This is a custom ESLint configuration for use server side
 * typescript packages.
 *
 * Extends the base config and adds specific rules for server-side code:
 * - Stricter TypeScript checks
 * - Node.js environment globals
 * - Security best practices for server code
 */

const config: Linter.FlatConfig[] = [
  ...baseConfig,
  {
    // Server-specific configuration with Node.js plugin
    files: ['**/*.js', '**/*.ts', '**/*.mjs', '**/*.cjs', '**/*.mts', '**/*.cts'],
    plugins: {
      node: nodePlugin,
    },
  },
  {
    // Server-side specific files with Node.js globals
    files: ['**/*.{js,ts,mjs,cjs,mts,cts}'],
    languageOptions: {
      globals: {
        ...globals.es2021,
        ...globals.node,
        process: true, // Explicitly include process global
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      // Enforce strict TypeScript usage in server code
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for practical use
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Node.js specific rules
      'node/no-deprecated-api': 'off', // Disabled due to compatibility issues with ESLint v9
      'node/no-extraneous-import': 'error',
      'node/no-missing-import': 'off', // TypeScript handles this better
      'node/no-unpublished-import': 'off', // Often too strict
      'node/no-unsupported-features/es-syntax': 'off', // TypeScript handles this

      // Additional security recommendations for server-side code
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-unsafe-regex': 'error',
    },
  },
  {
    // Test file specific configuration
    files: [
      '**/__tests__/**/*',
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts}',
      '**/vitest.config.{js,ts,mjs}',
    ],
    rules: {
      '@typescript-eslint/await-thenable': 'off', // Disable type-aware rules for test config files
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      'import/no-extraneous-dependencies': 'off',
      'node/no-deprecated-api': 'off', // Disable for test files due to compatibility issues
    },
  },
];

export default config;
