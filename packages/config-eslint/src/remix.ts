import { Linter } from 'eslint';
import globals from 'globals';

// remix.ts
import reactPackageConfig from './react-package';
import serverConfig from './server';

/*
 * This is a custom ESLint configuration for use with
 * Remix applications. Extends both React and Server configs
 * to handle Remix's fullstack nature.
 */

const config: Linter.FlatConfig[] = [
  ...serverConfig, // Base server rules
  ...reactPackageConfig, // Base React rules (using react-package instead of non-existent react.mjs)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['public/**'],
    languageOptions: {
      globals: {
        ...globals.browser, // Browser globals for client components
        ...globals.node, // Node globals for server code
      },
    },
    rules: {
      // Override any conflicting rules
      'import/no-default-export': 'off', // Remix needs default exports

      // Use perfectionist for Remix-specific import sorting (consistent with base config)
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
            'unknown',
          ],
          ignoreCase: true,
          internalPattern: [
            '~/**', // Remix convention for app imports
            '@repo/**',
          ],
          newlinesBetween: 'always',
          order: 'asc',
          type: 'natural',
        },
      ],
    },
  },
  {
    // Remix-specific file patterns
    files: [
      'app/routes/**/*.{js,jsx,ts,tsx}',
      'app/root.{js,jsx,ts,tsx}',
      'app/entry.*.{js,jsx,ts,tsx}',
    ],
    rules: {
      'import/prefer-default-export': 'off',
    },
  },
  {
    // Server-side only files
    files: ['app/server/**/*.{js,ts}', 'app/models/**/*.{js,ts}', 'app/services/**/*.{js,ts}'],
    rules: {
      // Server-side specific rules
    },
  },
];

export default config;
