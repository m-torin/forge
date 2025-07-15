/**
 * Comprehensive ESLint configuration for the monorepo
 * Provides rules for TypeScript, React, testing, and code quality
 */

/// <reference path="./types/eslint-plugins.d.ts" />

import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vitestPlugin from "@vitest/eslint-plugin";
import type { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import playwrightPlugin from "eslint-plugin-playwright";
import pnpmPlugin from "eslint-plugin-pnpm";
import promisePlugin from "eslint-plugin-promise";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import securityPlugin from "eslint-plugin-security";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import globals from "globals";
import jsoncParser from "jsonc-eslint-parser";
import yamlParser from "yaml-eslint-parser";

// Import custom rules
import noUsedUnderscoreVars from "./rules/no-used-underscore-vars";

// Import shared types and constants
import {
  FILE_PATTERNS,
  IGNORE_PATTERNS,
  SEVERITY,
  createConfig,
  createRules,
  type RulesRecord,
} from "./types/config";

// Constants for specific configurations
const STYLE_EXTENSIONS = {
  json: "always",
  css: "always",
  scss: "always",
  sass: "always",
  less: "always",
} as const;

const IMAGE_EXTENSIONS = {
  png: "always",
  svg: "always",
  jpg: "always",
  jpeg: "always",
  gif: "always",
  webp: "always",
  ico: "always",
} as const;

const CONFIG_EXTENSIONS = {
  config: "always",
} as const;

const STORYBOOK_EXTENSIONS = {
  stories: "always",
} as const;

// Create static plugin instances for better resolution in monorepo
const plugins = {
  "@typescript-eslint": tsPlugin as any,
  import: importPlugin,
  perfectionist: perfectionistPlugin,
  promise: promisePlugin,
  security: securityPlugin,
  "unused-imports": unusedImportsPlugin,
  "no-used-underscore-vars": {
    rules: {
      "no-used-underscore-vars": noUsedUnderscoreVars,
    },
  },
};

// Shared rule configurations
const sharedRules = createRules({
  // Import plugin rules
  "import/first": SEVERITY.ERROR,
  "import/no-cycle": SEVERITY.OFF, // Performance reasons
  "import/no-duplicates": SEVERITY.ERROR,
  "import/no-self-import": SEVERITY.ERROR,
  "import/prefer-default-export": SEVERITY.OFF,
  "import/extensions": [
    SEVERITY.ERROR,
    "never",
    { ...STYLE_EXTENSIONS, ...IMAGE_EXTENSIONS, ...CONFIG_EXTENSIONS, ...STORYBOOK_EXTENSIONS },
  ],

  // Core ESLint rules
  "no-console": SEVERITY.WARN,
  "no-debugger": SEVERITY.WARN,
  "no-unused-vars": SEVERITY.OFF, // Using unused-imports plugin
  "no-useless-catch": SEVERITY.ERROR,
  
  // Quote handling
  "quotes": [SEVERITY.ERROR, "single", { avoidEscape: true }],

  // TypeScript rules to prevent null checking conflicts (without type information)
  "@typescript-eslint/no-non-null-assertion": SEVERITY.WARN,

  // Perfectionist rules
  "perfectionist/sort-imports": SEVERITY.OFF, // Performance optimization

  // Promise rules (lenient configuration)
  "promise/always-return": SEVERITY.WARN,
  "promise/catch-or-return": SEVERITY.WARN,
  "promise/no-callback-in-promise": SEVERITY.WARN,
  "promise/no-nesting": SEVERITY.WARN,
  "promise/no-promise-in-callback": SEVERITY.WARN,
  "promise/no-return-wrap": SEVERITY.WARN,
  "promise/param-names": [
    SEVERITY.ERROR,
    { rejectPattern: "^_?reject$", resolvePattern: "^_?resolve$" },
  ],
  "promise/prefer-await-to-then": SEVERITY.WARN,

  // Security rules
  "security/detect-bidi-characters": SEVERITY.ERROR,
  "security/detect-buffer-noassert": SEVERITY.ERROR,
  "security/detect-child-process": SEVERITY.ERROR,
  "security/detect-disable-mustache-escape": SEVERITY.ERROR,
  "security/detect-eval-with-expression": SEVERITY.ERROR,
  "security/detect-new-buffer": SEVERITY.ERROR,
  "security/detect-no-csrf-before-method-override": SEVERITY.ERROR,
  "security/detect-non-literal-fs-filename": SEVERITY.WARN,
  "security/detect-non-literal-regexp": SEVERITY.WARN,
  "security/detect-non-literal-require": SEVERITY.ERROR,
  "security/detect-object-injection": SEVERITY.OFF,
  "security/detect-possible-timing-attacks": SEVERITY.WARN,
  "security/detect-pseudoRandomBytes": SEVERITY.ERROR,
  "security/detect-unsafe-regex": SEVERITY.ERROR,

  // Unused imports
  "unused-imports/no-unused-imports": SEVERITY.ERROR,
  "unused-imports/no-unused-vars": [
    SEVERITY.WARN,
    {
      args: "after-used",
      argsIgnorePattern: '^_',
      caughtErrors: "all",
      caughtErrorsIgnorePattern: '^_',
      vars: "all",
      varsIgnorePattern: '^_',
    },
  ],

  // Custom rules
  "no-used-underscore-vars/no-used-underscore-vars": SEVERITY.ERROR,
});

// Vitest rules configuration
const vitestRules: RulesRecord = {
  // Test Structure & Organization
  "vitest/expect-expect": SEVERITY.WARN,
  "vitest/no-identical-title": SEVERITY.ERROR,
  "vitest/no-focused-tests": SEVERITY.ERROR,
  "vitest/no-disabled-tests": SEVERITY.WARN,
  "vitest/no-commented-out-tests": SEVERITY.WARN,
  "vitest/consistent-test-it": [SEVERITY.ERROR, { fn: "test" }],
  "vitest/require-top-level-describe": SEVERITY.OFF,

  // Test Best Practices
  "vitest/no-conditional-tests": SEVERITY.ERROR,
  "vitest/no-conditional-in-test": SEVERITY.ERROR,
  "vitest/no-conditional-expect": SEVERITY.ERROR,
  "vitest/no-test-return-statement": SEVERITY.ERROR,
  "vitest/no-standalone-expect": SEVERITY.ERROR,
  "vitest/valid-expect": SEVERITY.ERROR,
  "vitest/valid-title": SEVERITY.ERROR,
  "vitest/valid-describe-callback": SEVERITY.ERROR,

  // Assertion Preferences
  "vitest/prefer-to-be": SEVERITY.WARN,
  "vitest/prefer-to-be-truthy": SEVERITY.WARN,
  "vitest/prefer-to-be-falsy": SEVERITY.WARN,
  "vitest/prefer-to-be-object": SEVERITY.WARN,
  "vitest/prefer-to-contain": SEVERITY.WARN,
  "vitest/prefer-to-have-length": SEVERITY.WARN,
  "vitest/prefer-equality-matcher": SEVERITY.WARN,
  "vitest/prefer-strict-equal": SEVERITY.WARN,
  "vitest/prefer-comparison-matcher": SEVERITY.WARN,
  "vitest/prefer-lowercase-title": SEVERITY.WARN,
  "vitest/prefer-snapshot-hint": SEVERITY.OFF,

  // Async & Hooks
  "vitest/no-done-callback": SEVERITY.ERROR,
  "vitest/prefer-hooks-on-top": SEVERITY.WARN,
  "vitest/prefer-hooks-in-order": SEVERITY.WARN,
  "vitest/require-hook": SEVERITY.OFF,

  // Other Rules
  "vitest/no-alias-methods": SEVERITY.WARN,
  "vitest/no-interpolation-in-snapshots": SEVERITY.ERROR,
  "vitest/no-large-snapshots": [SEVERITY.WARN, { maxSize: 50 }],
  "vitest/no-mocks-import": SEVERITY.ERROR,
  "vitest/no-restricted-matchers": SEVERITY.OFF,
  "vitest/no-restricted-vi-methods": SEVERITY.OFF,
  "vitest/no-test-prefixes": SEVERITY.ERROR,
  "vitest/prefer-called-with": SEVERITY.WARN,
  "vitest/prefer-mock-promise-shorthand": SEVERITY.WARN,
  "vitest/prefer-spy-on": SEVERITY.WARN,
  "vitest/prefer-todo": SEVERITY.WARN,
  "vitest/require-to-throw-message": SEVERITY.WARN,
};

// Playwright rules configuration
const playwrightRules: RulesRecord = {
  "playwright/expect-expect": SEVERITY.WARN,
  "playwright/max-nested-describe": [SEVERITY.WARN, { max: 5 }],
  "playwright/missing-playwright-await": SEVERITY.ERROR,
  "playwright/no-conditional-expect": SEVERITY.ERROR,
  "playwright/no-conditional-in-test": SEVERITY.ERROR,
  "playwright/no-element-handle": SEVERITY.WARN,
  "playwright/no-eval": SEVERITY.ERROR,
  "playwright/no-focused-test": SEVERITY.ERROR,
  "playwright/no-force-option": SEVERITY.WARN,
  "playwright/no-nested-step": SEVERITY.ERROR,
  "playwright/no-networkidle": SEVERITY.WARN,
  "playwright/no-page-pause": SEVERITY.ERROR,
  "playwright/no-restricted-matchers": SEVERITY.OFF,
  "playwright/no-skipped-test": SEVERITY.WARN,
  "playwright/no-useless-await": SEVERITY.ERROR,
  "playwright/no-useless-not": SEVERITY.WARN,
  "playwright/no-wait-for-selector": SEVERITY.WARN,
  "playwright/no-wait-for-timeout": SEVERITY.WARN,
  "playwright/prefer-comparison-matcher": SEVERITY.WARN,
  "playwright/prefer-equality-matcher": SEVERITY.WARN,
  "playwright/prefer-strict-equal": SEVERITY.WARN,
  "playwright/prefer-to-be": SEVERITY.WARN,
  "playwright/prefer-to-contain": SEVERITY.WARN,
  "playwright/prefer-to-have-count": SEVERITY.WARN,
  "playwright/prefer-to-have-length": SEVERITY.WARN,
  "playwright/prefer-web-first-assertions": SEVERITY.ERROR,
  "playwright/require-top-level-describe": SEVERITY.OFF,
  "playwright/valid-describe-callback": SEVERITY.ERROR,
  "playwright/valid-expect": SEVERITY.ERROR,
  "playwright/valid-title": SEVERITY.ERROR,
};

// React rules configuration
const reactRules: RulesRecord = {
  // React Hooks
  "react-hooks/rules-of-hooks": SEVERITY.ERROR,
  "react-hooks/exhaustive-deps": SEVERITY.WARN,

  // Core React Rules
  "react/react-in-jsx-scope": SEVERITY.OFF,
  "react/jsx-uses-react": SEVERITY.OFF,
  "react/jsx-uses-vars": SEVERITY.ERROR,
  "react/jsx-key": SEVERITY.ERROR,
  "react/jsx-no-duplicate-props": SEVERITY.ERROR,
  "react/jsx-no-undef": SEVERITY.ERROR,
  "react/no-array-index-key": SEVERITY.WARN,
  "react/no-children-prop": SEVERITY.ERROR,
  "react/no-danger-with-children": SEVERITY.ERROR,
  "react/no-deprecated": SEVERITY.ERROR,
  "react/no-direct-mutation-state": SEVERITY.ERROR,
  "react/no-find-dom-node": SEVERITY.ERROR,
  "react/no-is-mounted": SEVERITY.ERROR,
  "react/no-render-return-value": SEVERITY.ERROR,
  "react/no-string-refs": SEVERITY.ERROR,
  "react/no-unescaped-entities": [SEVERITY.ERROR, { 
    forbid: [
      { char: ">", alternatives: ["&gt;"] },
      { char: "}", alternatives: ["&#125;"] }
    ]
  }],
  "react/no-unknown-property": SEVERITY.ERROR,
  "react/no-unsafe": SEVERITY.ERROR,
  "react/no-unstable-nested-components": SEVERITY.ERROR,
  "react/prop-types": SEVERITY.OFF,
  "react/require-render-return": SEVERITY.ERROR,

  // JSX Style
  "react/jsx-curly-brace-presence": [SEVERITY.ERROR, { children: "never", props: "never" }],
  "react/jsx-fragments": [SEVERITY.ERROR, "syntax"],
  "react/jsx-no-useless-fragment": [SEVERITY.ERROR, { allowExpressions: false }],
  "react/self-closing-comp": [SEVERITY.ERROR, { component: true, html: true }],
  
  // JSX attribute quotes (using jsx-a11y plugin which provides jsx-quotes)
  "jsx-quotes": [SEVERITY.ERROR, "prefer-single"],

  // Accessibility
  "jsx-a11y/alt-text": SEVERITY.ERROR,
  "jsx-a11y/anchor-has-content": SEVERITY.ERROR,
  "jsx-a11y/anchor-is-valid": SEVERITY.ERROR,
  "jsx-a11y/aria-props": SEVERITY.ERROR,
  "jsx-a11y/aria-role": [SEVERITY.ERROR, { ignoreNonDOM: true }],
  "jsx-a11y/img-redundant-alt": SEVERITY.ERROR,
  "jsx-a11y/no-autofocus": SEVERITY.WARN,
  "jsx-a11y/role-has-required-aria-props": SEVERITY.ERROR,
};

// Main configuration array
const config: Linter.FlatConfig[] = [
  // Global ignores
  createConfig({
    ignores: IGNORE_PATTERNS,
  }),

  // Base configuration for all JS/TS files
  createConfig({
    files: [FILE_PATTERNS.ALL_JS_TS],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
      },
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: plugins,
    rules: sharedRules,
  }),


  // Test files configuration
  createConfig({
    files: FILE_PATTERNS.TEST_FILES,
    languageOptions: {
      globals: {
        ...globals.jest,
        afterAll: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        test: "readonly",
        vi: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin as any,
      vitest: vitestPlugin as any,
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      ...vitestRules,
      "no-console": SEVERITY.OFF,
      "security/detect-object-injection": SEVERITY.OFF,
      "perfectionist/sort-objects": SEVERITY.OFF,
      // Allow non-null assertions in test files where they are safe
      "@typescript-eslint/no-non-null-assertion": SEVERITY.OFF,
      "unused-imports/no-unused-vars": SEVERITY.OFF,
    },
  }),

  // E2E/Playwright test files
  createConfig({
    files: FILE_PATTERNS.E2E_FILES,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        page: "readonly",
        context: "readonly",
        browser: "readonly",
        chromium: "readonly",
        firefox: "readonly",
        webkit: "readonly",
      },
    },
    plugins: {
      playwright: playwrightPlugin,
      "unused-imports": unusedImportsPlugin,
    },
    rules: {
      ...playwrightRules,
      "no-console": SEVERITY.OFF,
      "no-empty-function": SEVERITY.OFF,
      "security/detect-object-injection": SEVERITY.OFF,
      "unused-imports/no-unused-vars": SEVERITY.OFF,
    },
  }),

  // React/JSX files
  createConfig({
    files: FILE_PATTERNS.REACT_FILES,
    languageOptions: {
      globals: {
        ...globals.browser,
        JSX: "readonly",
        React: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: reactRules,
    settings: {
      react: {
        version: 'detect',
      },
      "jsx-a11y": {
        components: {
          Button: "button",
          Input: "input",
          Link: "a",
        },
      },
    },
  }),

  // Configuration files
  createConfig({
    files: FILE_PATTERNS.CONFIG_FILES,
    rules: {
      "import/no-extraneous-dependencies": SEVERITY.OFF,
      "no-console": SEVERITY.OFF,
    },
  }),

  // Script files
  createConfig({
    files: FILE_PATTERNS.SCRIPT_FILES,
    rules: {
      "no-console": SEVERITY.OFF,
      // Script files often need dynamic file operations
      "security/detect-non-literal-fs-filename": SEVERITY.OFF,
      "security/detect-non-literal-require": SEVERITY.OFF,
      "security/detect-non-literal-regexp": SEVERITY.OFF,
    },
  }),

  // Environment configuration files
  createConfig({
    files: ["**/env.ts"],
    rules: {
      "no-console": SEVERITY.OFF,
    },
  }),

  // CommonJS files
  createConfig({
    files: FILE_PATTERNS.COMMONJS_FILES,
    languageOptions: {
      sourceType: "commonjs",
    },
  }),

  // Type definition files
  createConfig({
    files: FILE_PATTERNS.TYPE_DEFINITION_FILES,
    rules: {
      "import/no-duplicates": SEVERITY.OFF,
    },
  }),

  // Published packages - stricter rules
  createConfig({
    files: ["packages/*/src/**/*.{ts,tsx,js,jsx}"],
    ignores: ["**/__tests__/**", "**/*.test.*", "**/*.spec.*", "**/examples/**"],
    rules: {
      "no-console": SEVERITY.WARN,
    },
  }),

  // Utility packages - more lenient
  createConfig({
    files: [
      "packages/analytics/**/*.{ts,tsx,js,jsx}",
      "packages/design-system/**/*.{ts,tsx,js,jsx}",
      "packages/testing/**/*.{ts,tsx,js,jsx}",
      "packages/payments/**/*.{ts,tsx,js,jsx}",
      "packages/ai/**/*.{ts,tsx,js,jsx}",
      "packages/orchestration/**/*.{ts,tsx,js,jsx}",
      "packages/links/**/*.{ts,tsx,js,jsx}",
      "packages/feature-flags/**/*.{ts,tsx,js,jsx}",
      "packages/observability/**/*.{ts,tsx,js,jsx}",
    ],
    rules: {
      "no-console": SEVERITY.OFF,
      "no-empty-function": SEVERITY.OFF,
      "import/extensions": SEVERITY.OFF,
      "promise/always-return": SEVERITY.WARN,
      "unused-imports/no-unused-vars": [
        SEVERITY.WARN,
        {
          args: "after-used",
          argsIgnorePattern: '^_',
          caughtErrors: "all",
          caughtErrorsIgnorePattern: '^_',
          vars: "all",
          varsIgnorePattern: '^_',
        },
      ],
      "testing-library/no-wait-for-multiple-assertions": SEVERITY.WARN,
      "promise/param-names": SEVERITY.WARN,
    },
  }),

  // Links package - extra lenient
  createConfig({
    files: ["packages/links/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-console": SEVERITY.OFF,
      "no-empty-function": SEVERITY.OFF,
      "import/extensions": SEVERITY.OFF,
      "unused-imports/no-unused-vars": SEVERITY.OFF,
      "unused-imports/no-unused-imports": SEVERITY.OFF,
    },
  }),

  // Performance optimizations
  createConfig({
    files: [FILE_PATTERNS.ALL_JS_TS],
    rules: {
      ...(process.env.NODE_ENV === "production" && {
        "import/no-cycle": SEVERITY.OFF,
      }),
    },
  }),

  // PNPM configuration files
  createConfig({
    files: ["**/package.json"],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      pnpm: pnpmPlugin,
    },
    rules: {
      "pnpm/json-valid-catalog": SEVERITY.ERROR,
      "pnpm/json-prefer-workspace-settings": SEVERITY.WARN,
    },
  }),

  createConfig({
    files: ["**/pnpm-workspace.yaml", "**/pnpm-workspace.yml"],
    languageOptions: {
      parser: yamlParser,
    },
    plugins: {
      pnpm: pnpmPlugin,
    },
    rules: {
      "pnpm/yaml-no-unused-catalog-item": SEVERITY.ERROR,
      "pnpm/yaml-no-duplicate-catalog-item": SEVERITY.ERROR,
    },
  }),

  // Prettier - must be last
  eslintConfigPrettier,

  // MJS files
  createConfig({
    files: FILE_PATTERNS.MJS_FILES,
    rules: {
      "no-console": SEVERITY.OFF,
    },
  }),

  // Examples files
  createConfig({
    files: FILE_PATTERNS.EXAMPLES_FILES,
    rules: {
      "no-console": SEVERITY.OFF,
    },
  }),
];

export default config;
