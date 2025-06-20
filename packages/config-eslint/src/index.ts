/// <reference path="./types/eslint-plugins.d.ts" />

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import vitestPlugin from '@vitest/eslint-plugin';
import { Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import playwrightPlugin from 'eslint-plugin-playwright';
import pnpmPlugin from 'eslint-plugin-pnpm';
import promisePlugin from 'eslint-plugin-promise';
// @ts-ignore - No types available for this plugin import
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import securityPlugin from 'eslint-plugin-security';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';
import yamlParser from 'yaml-eslint-parser';

// Import custom rules
import noUsedUnderscoreVars from './rules/no-used-underscore-vars';

// eslint rule configuration type
type RulesRecord = Record<string, any>;

// Note: Type-aware rules removed for better performance and reliability
// Use separate `pnpm typecheck` for TypeScript type checking

// Shared rule configurations to avoid duplication
const sharedRules: RulesRecord = {
  // Import plugin rules
  'import/first': 'error',
  'import/no-cycle': 'off', // Disable temporarily - can cause performance issues
  'import/no-duplicates': 'error',
  'import/no-self-import': 'error',
  'import/prefer-default-export': 'off',
  // Enforce no file extensions in imports (TypeScript-only monorepo)
  'import/extensions': [
    'error',
    'never',
    {
      json: 'always',
      css: 'always',
      scss: 'always',
      sass: 'always',
      less: 'always',
    },
  ],
  // Core rules
  'no-console': 'warn',
  'no-debugger': 'warn',
  'no-unused-vars': 'off', // Use unused-imports plugin instead
  'no-useless-catch': 'error', // ESLint core rule - preferred over sonarjs version

  // Disable perfectionist import sorting temporarily to debug performance issues
  'perfectionist/sort-imports': 'off',
  // Promise rules (lenient)
  'promise/always-return': 'warn',

  'promise/catch-or-return': 'warn',
  'promise/no-callback-in-promise': 'warn',
  'promise/no-nesting': 'warn',
  'promise/no-promise-in-callback': 'warn',
  'promise/no-return-wrap': 'warn',

  'promise/param-names': ['error', { rejectPattern: '^_?reject$', resolvePattern: '^_?resolve$' }],
  'promise/prefer-await-to-then': 'warn',
  // Security rules - Comprehensive configuration
  'security/detect-bidi-characters': 'error', // Prevent trojan source attacks
  'security/detect-buffer-noassert': 'error',
  'security/detect-child-process': 'error',
  'security/detect-disable-mustache-escape': 'error', // Prevent XSS in templates
  'security/detect-eval-with-expression': 'error',
  'security/detect-new-buffer': 'error', // Deprecated Buffer constructor
  'security/detect-no-csrf-before-method-override': 'error', // Express middleware order
  'security/detect-non-literal-fs-filename': 'warn', // May have false positives
  'security/detect-non-literal-regexp': 'warn', // Potential ReDoS
  'security/detect-non-literal-require': 'error', // Prevent arbitrary code execution
  'security/detect-object-injection': 'off', // Too many false positives
  'security/detect-possible-timing-attacks': 'warn', // Use crypto.timingSafeEqual instead
  'security/detect-pseudoRandomBytes': 'error', // Use crypto.randomBytes instead
  'security/detect-unsafe-regex': 'error',

  // Unused imports plugin
  'unused-imports/no-unused-imports': 'error',

  'unused-imports/no-unused-vars': [
    'error',
    {
      args: 'after-used',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      vars: 'all',
      varsIgnorePattern: '^_',
    },
  ],

  // Custom rules
  'no-used-underscore-vars/no-used-underscore-vars': 'error',
};

const config: Linter.FlatConfig[] = [
  // ============================================
  // ESLint 9 Flat Config - Comprehensive Setup
  // ============================================

  // ============================================
  // 1. GLOBAL IGNORES - Applied to all files
  // ============================================
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.cache/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/.turbo/**',
      '**/generated/**',
      '**/.next/**',
      '**/.vercel/**',
      '**/*.md',
      '**/*.mdx',
      'labs/**',
      'services/**',
    ],
  },

  // ============================================
  // 2. BASE CONFIGURATION - All JS/TS files
  // ============================================
  {
    ...js.configs.recommended,
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      perfectionist: perfectionistPlugin,
      promise: promisePlugin,
      security: securityPlugin,
      'unused-imports': unusedImportsPlugin,
      'no-used-underscore-vars': {
        rules: {
          'no-used-underscore-vars': noUsedUnderscoreVars,
        },
      },
    },
    rules: sharedRules,
  },

  // ============================================
  // 3. TEST FILES CONFIGURATION
  // ============================================
  {
    files: [
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
    languageOptions: {
      globals: {
        ...globals.jest,
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        test: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      // Relax rules for tests
      'no-console': 'off',
      'security/detect-object-injection': 'off',
      'perfectionist/sort-objects': 'off', // Allow unsorted objects in tests

      // Vitest rules - Comprehensive configuration for ESLint 9
      // Test Structure & Organization
      'vitest/expect-expect': 'warn',
      'vitest/no-identical-title': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-commented-out-tests': 'warn',
      'vitest/consistent-test-it': ['error', { fn: 'test' }],
      'vitest/require-top-level-describe': 'off', // Optional, enable if you want all tests in describe blocks

      // Test Best Practices
      'vitest/no-conditional-tests': 'error',
      'vitest/no-conditional-in-test': 'error',
      'vitest/no-conditional-expect': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/no-standalone-expect': 'error',
      'vitest/valid-expect': 'error',
      'vitest/valid-title': 'error',
      'vitest/valid-describe-callback': 'error',

      // Assertion Preferences
      'vitest/prefer-to-be': 'warn',
      'vitest/prefer-to-be-truthy': 'warn',
      'vitest/prefer-to-be-falsy': 'warn',
      'vitest/prefer-to-be-object': 'warn',
      'vitest/prefer-to-contain': 'warn',
      'vitest/prefer-to-have-length': 'warn',
      'vitest/prefer-equality-matcher': 'warn',
      'vitest/prefer-strict-equal': 'warn',
      'vitest/prefer-comparison-matcher': 'warn',
      'vitest/prefer-lowercase-title': 'warn',
      'vitest/prefer-snapshot-hint': 'off', // Enable if using snapshots

      // Async & Hooks
      'vitest/no-done-callback': 'error',
      'vitest/prefer-hooks-on-top': 'warn',
      'vitest/prefer-hooks-in-order': 'warn',
      'vitest/require-hook': 'off', // Enable if you want to enforce using hooks for setup/teardown

      // Other Rules
      'vitest/no-alias-methods': 'warn',
      'vitest/no-interpolation-in-snapshots': 'error',
      'vitest/no-large-snapshots': ['warn', { maxSize: 50 }],
      'vitest/no-mocks-import': 'error',
      'vitest/no-restricted-matchers': 'off', // Configure if needed
      'vitest/no-restricted-vi-methods': 'off', // Configure if needed
      'vitest/no-test-prefixes': 'error',
      'vitest/prefer-called-with': 'warn',
      'vitest/prefer-mock-promise-shorthand': 'warn',
      'vitest/prefer-spy-on': 'warn',
      'vitest/prefer-todo': 'warn',
      'vitest/require-to-throw-message': 'warn',
    },
  },

  // ============================================
  // 3b. E2E/PLAYWRIGHT TEST FILES
  // ============================================
  {
    files: [
      '**/e2e/**/*.{js,jsx,ts,tsx}',
      '**/tests/e2e/**/*.{js,jsx,ts,tsx}',
      '**/*.e2e.{js,jsx,ts,tsx}',
      '**/playwright/**/*.{js,jsx,ts,tsx}',
      '**/playwright.config.*',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        page: 'readonly',
        context: 'readonly',
        browser: 'readonly',
        chromium: 'readonly',
        firefox: 'readonly',
        webkit: 'readonly',
      },
    },
    plugins: {
      playwright: playwrightPlugin,
    },
    rules: {
      // Playwright-specific rules
      'playwright/expect-expect': 'warn',
      'playwright/max-nested-describe': ['warn', { max: 5 }],
      'playwright/missing-playwright-await': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-element-handle': 'warn',
      'playwright/no-eval': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'warn',
      'playwright/no-nested-step': 'error',
      'playwright/no-networkidle': 'warn',
      'playwright/no-page-pause': 'error',
      'playwright/no-restricted-matchers': 'off', // Configure if needed
      'playwright/no-skipped-test': 'warn',
      'playwright/no-useless-await': 'error',
      'playwright/no-useless-not': 'warn',
      'playwright/no-wait-for-selector': 'warn',
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/prefer-comparison-matcher': 'warn',
      'playwright/prefer-equality-matcher': 'warn',
      'playwright/prefer-strict-equal': 'warn',
      'playwright/prefer-to-be': 'warn',
      'playwright/prefer-to-contain': 'warn',
      'playwright/prefer-to-have-count': 'warn',
      'playwright/prefer-to-have-length': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/require-top-level-describe': 'off', // Optional
      'playwright/valid-describe-callback': 'error',
      'playwright/valid-expect': 'error',
      'playwright/valid-title': 'error',

      // Relax some general rules for E2E tests
      'no-console': 'off',
      'no-empty-function': 'off',
      'security/detect-object-injection': 'off',
    },
  },

  // ============================================
  // 3c. REACT/JSX FILES
  // ============================================
  {
    files: ['**/*.jsx', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        JSX: 'readonly',
        React: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // React Hooks Rules (Critical)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Core React Rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'error',
      'react/no-unstable-nested-components': 'error',
      'react/prop-types': 'off', // Using TypeScript instead
      'react/require-render-return': 'error',

      // JSX Style Rules
      'react/jsx-curly-brace-presence': ['error', { children: 'never', props: 'never' }],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: false }],
      'react/self-closing-comp': ['error', { component: true, html: true }],

      // Accessibility Rules (Basic)
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'jsx-a11y': {
        components: {
          Button: 'button',
          Input: 'input',
          Link: 'a',
        },
      },
    },
  },

  // ============================================
  // 4. CONFIGURATION FILES
  // ============================================
  {
    files: ['*.config.*', '.*rc.*', '*.setup.*'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
    },
  },

  // ============================================
  // 5. COMMONJS FILES
  // ============================================
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      // Allow require in CommonJS files
    },
  },

  // ============================================
  // 6. TYPE DEFINITION FILES
  // ============================================
  {
    files: ['**/*.d.ts'],
    rules: {
      'import/no-duplicates': 'off',
    },
  },

  // ============================================
  // 7. PUBLISHED PACKAGES - STRICTER RULES
  // ============================================
  {
    files: ['packages/*/src/**/*.{ts,tsx,js,jsx}'],
    ignores: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*', '**/examples/**'],
    rules: {
      'no-console': 'warn',
    },
  },

  // ============================================
  // 7b. UTILITY/DEVELOPMENT PACKAGES - MORE LENIENT (MUST COME AFTER 7)
  // ============================================
  {
    files: [
      'packages/analytics/**/*.{ts,tsx,js,jsx}',
      'packages/design-system/**/*.{ts,tsx,js,jsx}',
      'packages/testing/**/*.{ts,tsx,js,jsx}',
      'packages/payments/**/*.{ts,tsx,js,jsx}',
      'packages/ai/**/*.{ts,tsx,js,jsx}',
      'packages/orchestration/**/*.{ts,tsx,js,jsx}',
      'packages/links/**/*.{ts,tsx,js,jsx}',
      'packages/feature-flags/**/*.{ts,tsx,js,jsx}',
      'packages/observability/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-console': 'off', // Allow console.log in these packages
      'no-empty-function': 'off', // Allow empty functions in utility packages (especially testing)
      'import/extensions': 'off', // Allow file extensions in utility packages
      'promise/always-return': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
      'testing-library/no-wait-for-multiple-assertions': 'warn', // Downgrade to warning
      'promise/param-names': 'warn', // Downgrade Promise parameter naming to warning
    },
  },

  // ============================================
  // 7c. LINKS PACKAGE - EXTRA LENIENT (specific override)
  // ============================================
  {
    files: ['packages/links/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off',
      'no-empty-function': 'off',
      'import/extensions': 'off',
      'unused-imports/no-unused-vars': 'off', // Turn off completely for examples
      'unused-imports/no-unused-imports': 'off',
    },
  },

  // ============================================
  // 8. PERFORMANCE OPTIMIZATIONS
  // ============================================
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'],
    rules: {
      // Disable expensive rules in node_modules (if somehow included)
      ...(process.env.NODE_ENV === 'production' && {
        'import/no-cycle': 'off',
      }),
    },
  },

  // ============================================
  // 9. PNPM CONFIGURATION FILES
  // ============================================
  {
    files: ['**/package.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      pnpm: pnpmPlugin,
    },
    rules: {
      // PNPM package.json rules
      // 'pnpm/json-enforce-catalog': 'error', // Enforce catalog usage for dependencies - REMOVED
      'pnpm/json-valid-catalog': 'error', // Validate catalog references
      'pnpm/json-prefer-workspace-settings': 'warn', // Prefer workspace settings
    },
  },

  {
    files: ['**/pnpm-workspace.yaml', '**/pnpm-workspace.yml'],
    languageOptions: {
      parser: yamlParser,
    },
    plugins: {
      pnpm: pnpmPlugin,
    },
    rules: {
      // PNPM workspace rules
      'pnpm/yaml-no-unused-catalog-item': 'error', // Prevent unused catalog items
      'pnpm/yaml-no-duplicate-catalog-item': 'error', // Prevent duplicate catalog items
    },
  },

  // ============================================
  // 10. PRETTIER - MUST BE LAST!
  // ============================================
  eslintConfigPrettier,
];

export default config;
