import type { Linter } from 'eslint';

import baseConfig from './index';
import { createConfig, SEVERITY, type RulesRecord } from './types/config';

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

// File patterns for server-side code
const SERVER_FILE_PATTERNS = ['**/*.{js,ts,mjs,cjs,mts,cts}'];

// Create server-specific rules
const createServerRules = (): RulesRecord => ({
  // Stricter console usage for server code
  'no-console': SEVERITY.ERROR,

  // Server-side best practices
  'no-process-exit': SEVERITY.ERROR,
  'no-sync': SEVERITY.WARN,

  // Promise handling (stricter for server code)
  'promise/no-callback-in-promise': SEVERITY.ERROR,
  'promise/no-nesting': SEVERITY.ERROR,
  'promise/catch-or-return': SEVERITY.ERROR,
  'promise/always-return': SEVERITY.ERROR,

  // Additional security for server code
  'security/detect-non-literal-fs-filename': SEVERITY.ERROR,
  'security/detect-non-literal-require': SEVERITY.ERROR,
  'security/detect-possible-timing-attacks': SEVERITY.WARN,
  'security/detect-child-process': SEVERITY.ERROR,
  'security/detect-eval-with-expression': SEVERITY.ERROR,
});

// Main configuration array
const config: Linter.FlatConfig[] = [
  ...baseConfig,

  // Server-specific configuration
  createConfig({
    files: SERVER_FILE_PATTERNS,
    rules: createServerRules(),
  }),

  // Environment files - allow console for error handling (server override)
  createConfig({
    files: ['**/env.ts'],
    rules: {
      'no-console': SEVERITY.OFF,
    },
  }),
];

export default config;
