/**
 * ESLint configuration for Next.js applications
 * Extends React configuration with Next.js-specific rules for App Router and performance
 */

import { FlatCompat } from '@eslint/eslintrc';
import type { Linter } from 'eslint';
import globals from 'globals';

import reactConfig from './react-package';
import { createConfig, SEVERITY, type RulesRecord } from './types/config';

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps. Extends the React configuration and adds Next.js specific rules.
 *
 * Hierarchy: Base → React → Next.js
 *
 * This hierarchical structure:
 * 1. Reduces duplication between configurations
 * 2. Makes rule precedence more explicit
 * 3. Ensures React rules are consistently applied across React and Next.js projects
 * 4. Allows Next.js-specific rules to override React rules when needed
 *
 * When rules conflict, the last matching rule takes precedence in ESLint's flat config.
 * This means Next.js-specific rules will override React rules automatically.
 */

// Directory setup for compatibility layer
// Use Node 22's import.meta.dirname for ESM module directory
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname ?? process.cwd(),
});

// File pattern constants
const FILE_PATTERNS = {
  // Router patterns
  APP_ROUTER: ['app/**/*.{js,jsx,ts,tsx}'],
  PAGES_ROUTER: ['pages/**/*.{js,jsx,ts,tsx}'],

  // Route files that require default exports
  NEXT_ROUTES: [
    'app/**/page.{js,jsx,ts,tsx}',
    'app/**/layout.{js,jsx,ts,tsx}',
    'app/**/loading.{js,jsx,ts,tsx}',
    'app/**/error.{js,jsx,ts,tsx}',
    'app/**/not-found.{js,jsx,ts,tsx}',
    'app/**/default.{js,jsx,ts,tsx}',
    'app/**/template.{js,jsx,ts,tsx}',
    'app/**/global-error.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
  ],

  // Server components (default in App Router)
  SERVER_COMPONENTS: [
    'app/**/page.{js,jsx,ts,tsx}',
    'app/**/layout.{js,jsx,ts,tsx}',
    'app/**/loading.{js,jsx,ts,tsx}',
    'app/**/error.{js,jsx,ts,tsx}',
    'app/**/not-found.{js,jsx,ts,tsx}',
  ],

  // Server actions
  SERVER_ACTIONS: ['app/**/actions.{js,ts}', 'app/**/*actions.{js,ts}', 'app/**/*action.{js,ts}'],

  // Configuration files
  NEXT_CONFIG: ['next.config.{js,ts,mjs}', 'middleware.{js,ts}'],

  // React components
  REACT_COMPONENTS: ['**/*.{jsx,tsx}'],

  // Test patterns
  NEXT_TESTS: [
    'app/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'pages/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'app/**/__tests__/**/*.{js,jsx,ts,tsx}',
    'pages/**/__tests__/**/*.{js,jsx,ts,tsx}',
    'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],

  // Server component tests
  SERVER_COMPONENT_TESTS: [
    'app/**/page.{test,spec}.{js,jsx,ts,tsx}',
    'app/**/layout.{test,spec}.{js,jsx,ts,tsx}',
    'app/**/__tests__/**/page.{js,jsx,ts,tsx}',
    'app/**/__tests__/**/layout.{js,jsx,ts,tsx}',
  ],

  // All source files
  ALL_SOURCE: ['**/*.{js,jsx,ts,tsx}'],
};

// Build artifacts to ignore
const NEXT_IGNORE_PATTERNS = ['.next/**', 'out/**', 'dist/**'];

// Rule sets grouped by purpose
const createNextRules = (): RulesRecord => ({
  // Allow default exports for pages/components
  'import/no-default-export': SEVERITY.OFF,
});

const createRouteRules = (): RulesRecord => ({
  // Navigation patterns - using app directory
  '@next/next/no-html-link-for-pages': SEVERITY.OFF,
  // Export patterns for Next.js routes
  'import/no-default-export': SEVERITY.OFF,
  'import/prefer-default-export': SEVERITY.ERROR,
});

const createPerformanceRules = (): RulesRecord => ({
  // Font optimization
  '@next/next/google-font-display': SEVERITY.WARN,
  '@next/next/google-font-preconnect': SEVERITY.WARN,
  // Image optimization
  '@next/next/inline-script-id': SEVERITY.ERROR,
  '@next/next/next-script-for-ga': SEVERITY.ERROR,
  '@next/next/no-before-interactive-script-outside-document': SEVERITY.ERROR,
  '@next/next/no-img-element': SEVERITY.ERROR,
  // Script optimization
  '@next/next/no-sync-scripts': SEVERITY.ERROR,
});

const createAppRouterRules = (): RulesRecord => ({
  '@next/next/no-assign-module-variable': SEVERITY.ERROR,
  '@next/next/no-async-client-component': SEVERITY.ERROR,
  // Document patterns
  '@next/next/no-document-import-in-page': SEVERITY.ERROR,
  '@next/next/no-duplicate-head': SEVERITY.ERROR,
  '@next/next/no-head-import-in-document': SEVERITY.ERROR,
  '@next/next/no-html-link-for-pages': SEVERITY.ERROR,
});

const createReact19Rules = (): RulesRecord => ({
  // Support new React 19 hooks in exhaustive-deps
  'react-hooks/exhaustive-deps': [
    SEVERITY.WARN,
    {
      additionalHooks: '(useActionState|useOptimistic)',
    },
  ],
});

const createNextConfigRules = (): RulesRecord => ({
  // Allow default exports for Next.js config
  'import/no-default-export': SEVERITY.OFF,
  'import/prefer-default-export': SEVERITY.ERROR,
});

const createNextTestingRules = (): RulesRecord => ({
  'testing-library/no-container': SEVERITY.OFF, // Sometimes needed for Next.js testing
  'testing-library/no-node-access': SEVERITY.OFF, // Allow for server component testing
  'testing-library/no-render-in-lifecycle': SEVERITY.ERROR,
  'testing-library/prefer-screen-queries': SEVERITY.ERROR,
  'testing-library/render-result-naming-convention': SEVERITY.ERROR,
  // Disable Next.js-specific rules for test mocks
  '@next/next/no-img-element': SEVERITY.OFF, // Test mocks use standard <img> elements
  '@next/next/no-html-link-for-pages': SEVERITY.OFF, // Test mocks use standard <a> elements
});

const createServerComponentTestingRules = (): RulesRecord => ({
  'jest-dom/prefer-in-document': SEVERITY.OFF,
  'testing-library/await-async-queries': SEVERITY.OFF,
  'testing-library/no-unnecessary-act': SEVERITY.OFF,
  'testing-library/no-wait-for-side-effects': SEVERITY.OFF,
});

// Main configuration array
const config: Linter.FlatConfig[] = [
  // Base configurations
  ...reactConfig,
  ...(compat.extends(
    'plugin:@next/next/recommended',
    'plugin:@next/next/core-web-vitals',
  ) as Linter.FlatConfig[]),

  // Base Next.js configuration
  createConfig({
    files: FILE_PATTERNS.ALL_SOURCE,
    languageOptions: {
      globals: {
        ...globals.browser,
        React: true,
      },
    },
    rules: createNextRules(),
    settings: {
      next: {
        rootDir: '.',
      },
    },
  }),

  // Rules for all Next.js routes
  createConfig({
    files: FILE_PATTERNS.NEXT_ROUTES,
    rules: createRouteRules(),
  }),

  // Performance optimization rules
  createConfig({
    files: FILE_PATTERNS.ALL_SOURCE,
    rules: createPerformanceRules(),
  }),

  // App Router specific rules
  createConfig({
    files: FILE_PATTERNS.APP_ROUTER,
    rules: createAppRouterRules(),
  }),

  // Server Component specific rules
  createConfig({
    files: FILE_PATTERNS.SERVER_COMPONENTS,
    rules: {
      // Note: Client-only import rule removed as it's not supported in the current version
      // Add a placeholder rule to avoid empty object
      'no-console': SEVERITY.OFF,
    },
  }),

  // Client Component specific rules
  createConfig({
    files: FILE_PATTERNS.APP_ROUTER,
    ignores: FILE_PATTERNS.SERVER_COMPONENTS,
    rules: {
      // Note: 'use client' directive rule removed as it's not supported in the current version
      // Placeholder to avoid empty object
      'no-debugger': SEVERITY.ERROR,
    },
  }),

  // React 19 integration rules
  createConfig({
    files: FILE_PATTERNS.REACT_COMPONENTS,
    rules: createReact19Rules(),
  }),

  // Server Action specific rules
  createConfig({
    files: FILE_PATTERNS.SERVER_ACTIONS,
    rules: {
      // Note: 'use server' directive rule removed as it's not supported in the current version
      'no-console': SEVERITY.OFF,
    },
  }),

  // Next.js configuration file rules
  createConfig({
    files: FILE_PATTERNS.NEXT_CONFIG,
    rules: createNextConfigRules(),
  }),

  // Next.js testing configuration
  createConfig({
    files: FILE_PATTERNS.NEXT_TESTS,
    rules: createNextTestingRules(),
  }),

  // Server component testing configuration
  createConfig({
    files: FILE_PATTERNS.SERVER_COMPONENT_TESTS,
    rules: createServerComponentTestingRules(),
  }),

  // Ignore patterns (always last)
  createConfig({
    ignores: NEXT_IGNORE_PATTERNS,
  }),
];

export default config;
