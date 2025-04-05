import path from "node:path";

import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";

// next.ts
import reactConfig from "./react-package.js";

import type { Linter } from "eslint";

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
// Workaround for TS1470 error: Use path.resolve() instead of import.meta.url
const __dirname = path.resolve(path.dirname(""));
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// =========================================
// File pattern constants for better readability
// =========================================

// Router patterns
const APP_ROUTER_FILES = ["app/**/*.{js,jsx,ts,tsx}"];
const PAGES_ROUTER_FILES = ["pages/**/*.{js,jsx,ts,tsx}"];
const ALL_ROUTER_FILES = [...APP_ROUTER_FILES, ...PAGES_ROUTER_FILES];

// Server component patterns (default in App Router)
const SERVER_COMPONENT_FILES = [
  "app/**/page.{js,jsx,ts,tsx}",
  "app/**/layout.{js,jsx,ts,tsx}",
  "app/**/loading.{js,jsx,ts,tsx}",
  "app/**/error.{js,jsx,ts,tsx}",
  "app/**/not-found.{js,jsx,ts,tsx}",
];

// Server action patterns
const SERVER_ACTION_FILES = [
  "app/**/actions.{js,ts}",
  "app/**/*actions.{js,ts}",
  "app/**/*action.{js,ts}",
];

// Next.js specific files
const NEXT_CONFIG_FILES = ["next.config.{js,ts,mjs}", "middleware.{js,ts}"];

// React component files
const REACT_COMPONENT_FILES = ["**/*.{jsx,tsx}"];

// Test file patterns
const TEST_FILE_PATTERNS = [
  "**/*.{test,spec}.{js,jsx,ts,tsx}",
  "**/__tests__/**/*.{js,jsx,ts,tsx}",
];

// Next.js test file patterns
const NEXT_TEST_FILE_PATTERNS = [
  "app/**/*.{test,spec}.{js,jsx,ts,tsx}",
  "pages/**/*.{test,spec}.{js,jsx,ts,tsx}",
  "app/**/__tests__/**/*.{js,jsx,ts,tsx}",
  "pages/**/__tests__/**/*.{js,jsx,ts,tsx}",
];

// Cypress test file patterns
const CYPRESS_TEST_FILE_PATTERNS = [
  "**/*.cy.{js,jsx,ts,tsx}",
  "**/cypress/**/*.{js,jsx,ts,tsx}",
];

// Next.js Cypress test file patterns
const NEXT_CYPRESS_TEST_FILE_PATTERNS = [
  "app/**/*.cy.{js,jsx,ts,tsx}",
  "pages/**/*.cy.{js,jsx,ts,tsx}",
  "app/**/cypress/**/*.{js,jsx,ts,tsx}",
  "pages/**/cypress/**/*.{js,jsx,ts,tsx}",
];

// Server component test patterns
const SERVER_COMPONENT_TEST_PATTERNS = [
  "app/**/page.{test,spec}.{js,jsx,ts,tsx}",
  "app/**/layout.{test,spec}.{js,jsx,ts,tsx}",
  "app/**/__tests__/**/page.{js,jsx,ts,tsx}",
  "app/**/__tests__/**/layout.{js,jsx,ts,tsx}",
];

// All source files
const ALL_SOURCE_FILES = ["**/*.{js,jsx,ts,tsx}"];

// Build artifacts to ignore
const IGNORE_PATTERNS = [".next/**", "out/**", "dist/**"];

// =========================================
// Rule sets grouped by purpose
// =========================================

// Base Next.js configuration
const baseNextRules: Linter.FlatConfig = {
  files: ALL_SOURCE_FILES,
  languageOptions: {
    globals: {
      ...globals.browser,
      React: true,
    },
  },
  rules: {
    // TypeScript relaxation for Next.js
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Allow default exports for pages/components
    "import/no-default-export": "off",
  },
  settings: {
    next: {
      rootDir: ".",
    },
  },
};

// Rules for all Next.js routes (pages and app)
const routeRules: Linter.FlatConfig = {
  files: ALL_ROUTER_FILES,
  rules: {
    // Export patterns for Next.js routes
    "import/no-default-export": "off",
    "import/prefer-default-export": "error",

    // Navigation patterns
    "@next/next/no-html-link-for-pages": "error",
  },
};

// Performance optimization rules
const performanceRules: Linter.FlatConfig = {
  files: ALL_SOURCE_FILES,
  rules: {
    // Image optimization
    "@next/next/no-img-element": "error",

    "@next/next/inline-script-id": "error",
    "@next/next/no-before-interactive-script-outside-document": "error",
    "@next/next/next-script-for-ga": "error",
    // Script optimization
    "@next/next/no-sync-scripts": "error",

    // Font optimization
    "@next/next/google-font-display": "warn",
    "@next/next/google-font-preconnect": "warn",
  },
};

// App Router specific rules
const appRouterRules: Linter.FlatConfig = {
  files: APP_ROUTER_FILES,
  rules: {
    "@next/next/no-assign-module-variable": "error",
    "@next/next/no-async-client-component": "error",
    // Document patterns
    "@next/next/no-document-import-in-page": "error",
    "@next/next/no-duplicate-head": "error",
    "@next/next/no-head-import-in-document": "error",
    "@next/next/no-html-link-for-pages": "error",
  },
};

// Server Component specific rules
const serverComponentRules: Linter.FlatConfig = {
  files: SERVER_COMPONENT_FILES,
  rules: {
    // Prevent client-only code in server components
    "@next/next/no-client-only-import-in-server-component": "error",
  },
};

// Client Component specific rules
const clientComponentRules: Linter.FlatConfig = {
  files: APP_ROUTER_FILES,
  ignores: SERVER_COMPONENT_FILES,
  rules: {
    // Ensure 'use client' directive is present
    "@next/next/use-client-directive": "error",
  },
};

// React 19 integration rules
const react19Rules: Linter.FlatConfig = {
  files: REACT_COMPONENT_FILES,
  rules: {
    // Support new React 19 hooks in exhaustive-deps
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "(useActionState|useOptimistic)",
      },
    ],
  },
};

// Server Action specific rules
const serverActionRules: Linter.FlatConfig = {
  files: SERVER_ACTION_FILES,
  rules: {
    // Enforce proper 'use server' directive
    "@next/next/use-server-directive": "error",
  },
};

// Next.js configuration file rules
const nextConfigRules: Linter.FlatConfig = {
  files: NEXT_CONFIG_FILES,
  rules: {
    // Allow default exports for Next.js config
    "import/no-default-export": "off",
    "import/prefer-default-export": "error",

    // Ensure middleware is properly typed
    "@typescript-eslint/explicit-function-return-type": "error",
  },
};

// Ignore patterns
const ignorePatterns: Linter.FlatConfig = {
  ignores: IGNORE_PATTERNS,
};

// =========================================
// Next.js testing specific rules
// =========================================

// Next.js testing configuration
const nextTestingRules: Linter.FlatConfig = {
  files: NEXT_TEST_FILE_PATTERNS,
  rules: {
    "testing-library/no-container": "off", // Sometimes needed for Next.js testing
    // Adjust testing-library rules for Next.js
    "testing-library/no-node-access": "off", // Allow for server component testing

    // Ensure proper testing patterns for Next.js
    "testing-library/prefer-screen-queries": "error",
    "testing-library/render-result-naming-convention": "error",

    // Use the correct rule name for preventing render in lifecycle methods
    "testing-library/no-render-in-lifecycle": "error",
  },
};

// Next.js Cypress testing configuration
const nextCypressRules: Linter.FlatConfig = {
  files: NEXT_CYPRESS_TEST_FILE_PATTERNS,
  rules: {
    // Adjust Cypress rules for Next.js
    "cypress/no-unnecessary-waiting": "warn", // Downgrade to warning for Next.js routing

    "@next/next/no-html-link-for-pages": "off", // Allow regular links in tests
    // Disable rules that conflict with Next.js patterns
    "@next/next/no-img-element": "off", // Allow img in Cypress tests

    // Ensure proper testing patterns for Next.js
    "cypress/require-data-selectors": [
      "warn",
      {
        allowCssSelectors: true,
        customAttributeSelectors: ["data-testid", "data-cy", "data-test"],
      },
    ],
  },
};

// Server component testing configuration
const serverComponentTestingRules: Linter.FlatConfig = {
  files: SERVER_COMPONENT_TEST_PATTERNS,
  rules: {
    "testing-library/no-wait-for-side-effects": "off",
    "jest-dom/prefer-in-document": "off",
    // Disable client-side specific rules for server component tests
    "testing-library/await-async-queries": "off",

    // These rules don't apply to server component testing
    "testing-library/no-unnecessary-act": "off",
  },
};

// =========================================
// Combined configuration
// =========================================

const config: Linter.FlatConfig[] = [
  // Base configurations
  ...reactConfig,
  ...compat.extends(
    "plugin:@next/next/recommended",
    "plugin:@next/next/core-web-vitals",
  ),

  // Core Next.js rules
  baseNextRules,
  routeRules,
  performanceRules,

  // App Router specific rules
  appRouterRules,
  serverComponentRules,
  clientComponentRules,

  // React 19 and advanced patterns
  react19Rules,
  serverActionRules,
  nextConfigRules,

  // Next.js testing rules
  nextTestingRules,
  nextCypressRules,
  serverComponentTestingRules,

  // Ignore patterns (always last)
  ignorePatterns,
];

export default config;
