// server.ts
import baseConfig from './index.ts';
import globals from 'globals';
import nodePlugin from 'eslint-plugin-node';
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
    files: [
      '**/*.js',
      '**/*.ts',
      '**/*.mjs',
      '**/*.cjs',
      '**/*.mts',
      '**/*.cts',
    ],
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
      // Enforce strict TypeScript usage in server code
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // Node.js specific rules
      'node/no-deprecated-api': 'error',
      'node/no-extraneous-import': 'error',
      'node/no-missing-import': 'off', // TypeScript handles this better
      'node/no-unpublished-import': 'off', // Often too strict
      'node/no-unsupported-features/es-syntax': 'off', // TypeScript handles this

      // Additional security recommendations for server-side code
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
    },
  },
  {
    // Test file specific configuration
    files: [
      '**/__tests__/**/*',
      '**/*.test.{js,ts}',
      '**/*.spec.{js,ts}',
      '**/vitest.config.{js,ts}',
    ],
    rules: {
      // Relax rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
];

export default config;
