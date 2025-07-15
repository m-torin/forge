import type { Linter } from 'eslint';
import globals from 'globals';

import reactPackageConfig from './react-package';
import serverConfig from './server';
import { createConfig, SEVERITY } from './types/config';

/*
 * This is a custom ESLint configuration for use with
 * Remix applications. Extends both React and Server configs
 * to handle Remix's fullstack nature.
 */

// File patterns for Remix
const REMIX_PATTERNS = {
  ALL_FILES: ['**/*.{js,jsx,ts,tsx}'],
  ROUTE_FILES: [
    'app/routes/**/*.{js,jsx,ts,tsx}',
    'app/root.{js,jsx,ts,tsx}',
    'app/entry.*.{js,jsx,ts,tsx}',
  ],
  SERVER_FILES: ['app/server/**/*.{js,ts}', 'app/models/**/*.{js,ts}', 'app/services/**/*.{js,ts}'],
  PUBLIC_IGNORE: ['public/**'],
};

const config: Linter.FlatConfig[] = [
  ...serverConfig, // Base server rules
  ...reactPackageConfig, // Base React rules

  // Remix-specific configuration
  createConfig({
    files: REMIX_PATTERNS.ALL_FILES,
    ignores: REMIX_PATTERNS.PUBLIC_IGNORE,
    languageOptions: {
      globals: {
        ...globals.browser, // Browser globals for client components
        ...globals.node, // Node globals for server code
      },
    },
    rules: {
      // Override any conflicting rules
      'import/no-default-export': SEVERITY.OFF, // Remix needs default exports
    },
  }),

  // Remix routes configuration
  createConfig({
    files: REMIX_PATTERNS.ROUTE_FILES,
    rules: {
      'import/prefer-default-export': SEVERITY.OFF,
    },
  }),

  // Server-side only files
  createConfig({
    files: REMIX_PATTERNS.SERVER_FILES,
    rules: {
      // Server-side specific rules already handled by serverConfig
      'no-console': SEVERITY.ERROR,
    },
  }),

  // Environment files - allow console for error handling (remix override)
  createConfig({
    files: ['**/env.ts'],
    rules: {
      'no-console': SEVERITY.OFF,
    },
  }),
];

export default config;
