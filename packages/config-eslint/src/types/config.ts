import type { Linter } from 'eslint';

/**
 * ESLint rule severity levels
 */
export const SEVERITY = {
  OFF: 'off',
  WARN: 'warn',
  ERROR: 'error',
} as const;

type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];

/**
 * ESLint rules record with proper typing
 */
export type RulesRecord = Record<string, any>;

/**
 * File patterns commonly used across configs
 */
export const FILE_PATTERNS = {
  // JavaScript/TypeScript patterns
  ALL_JS_TS: '**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}',
  REACT_FILES: ['**/*.{jsx,tsx}'],
  TEST_FILES: [
    '**/__tests__/**/*',
    '**/*.test.*',
    '**/*.spec.*',
    '**/test/**/*',
    '**/*.setup.*',
    '**/vitest.config.*',
    '**/jest.config.*',
    '**/playwright.config.*',
    '**/e2e/**/*',
    '**/*.stories.*',
    '**/stories/**/*',
    '**/storybook/**/*',
    '**/.storybook/**/*',
    '**/playwright/**/*',
    '**/vitest/**/*',
  ],
  E2E_FILES: [
    '**/e2e/**/*.{js,jsx,ts,tsx}',
    '**/tests/e2e/**/*.{js,jsx,ts,tsx}',
    '**/*.e2e.{js,jsx,ts,tsx}',
    '**/playwright/**/*.{js,jsx,ts,tsx}',
    '**/playwright.config.*',
  ],
  CONFIG_FILES: ['*.config.*', '.*rc.*', '*.setup.*'],
  SCRIPT_FILES: [
    '**/scripts/**/*',
    '**/seed/**/*',
    '**/enhance-*.js',
    '**/migrate-*.js',
    '**/generate-*.js',
  ],
  COMMONJS_FILES: ['**/*.cjs'],
  TYPE_DEFINITION_FILES: ['**/*.d.ts'],
  MJS_FILES: ['**/*.mjs'],
  EXAMPLES_FILES: ['**/examples/**/*'],
};

/**
 * Common ignore patterns
 */
export const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.cache/**',
  '**/coverage/**',
  '**/.vitest-ui/coverage/**',
  '**/html/coverage/**',
  '**/coverage-browser/**',
  '**/*.min.js',
  '**/.turbo/**',
  '**/generated/**',
  '**/.next/**',
  '**/.vercel/**',
  '**/*.md',
  '**/*.mdx',
  '**/.kniprc.json',
  'labs/**',
  'services/**',
];

/**
 * Shared plugin instances type helper
 */
type PluginInstances = Record<string, any>;

/**
 * Helper to create a typed flat config
 */
export function createConfig(config: Linter.FlatConfig): Linter.FlatConfig {
  return config;
}

/**
 * Helper to create typed rules
 */
export function createRules(rules: RulesRecord): RulesRecord {
  return rules;
}
