import { Linter } from 'eslint';

import baseConfig from './index';

/*
 * This is a custom ESLint configuration for use server side
 * typescript packages.
 *
 * Extends the base config and adds specific rules for server-side code:
 * - Server-side best practices
 * - Server-side security considerations
 *
 * Note: eslint-plugin-node is not compatible with ESLint 9 flat config,
 * so we use built-in ESLint rules and the security plugin for server-side linting
 */

const config: Linter.FlatConfig[] = [
  ...baseConfig,
  {
    // Server-specific overrides
    files: ['**/*.{js,ts,mjs,cjs,mts,cts}'],
    rules: {
      // Stricter console usage for server code
      'no-console': 'error',
      // Server-side best practices
      'no-process-exit': 'error',

      'no-sync': 'warn',
      // Promise handling
      'promise/no-callback-in-promise': 'error',
      'promise/no-nesting': 'error',

      // Additional security for server code
      'security/detect-non-literal-fs-filename': 'error',

      'security/detect-non-literal-require': 'error',
      'security/detect-possible-timing-attacks': 'warn',
    },
  },
];

export default config;
