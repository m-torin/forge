// @ts-ignore - No types available for this plugin import
import cypressPlugin from 'eslint-plugin-cypress/flat';
import jestDomPlugin from 'eslint-plugin-jest-dom';
// @ts-ignore - No types available for this plugin import
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import testingLibraryPlugin from 'eslint-plugin-testing-library';

// react-package.ts
import baseConfig from './index.js';

import type { Linter } from 'eslint';

/*
 * This is a custom ESLint configuration for use with
 * React libraries and packages (not Next.js apps).
 *
 * Includes:
 * - React component and hooks rules
 * - JSX accessibility rules
 * - Testing Library and Jest DOM rules for test files
 */

// Test file patterns
const TEST_FILE_PATTERNS = [
  '**/*.{test,spec}.{js,jsx,ts,tsx}',
  '**/__tests__/**/*.{js,jsx,ts,tsx}',
];

// Cypress test file patterns
const CYPRESS_TEST_FILE_PATTERNS = ['**/*.cy.{js,jsx,ts,tsx}', '**/cypress/**/*.{js,jsx,ts,tsx}'];

// React component configuration
const reactComponentConfig: Linter.FlatConfig = {
  // React-specific configuration with React plugin
  files: ['**/*.jsx', '**/*.tsx'],
  languageOptions: {
    globals: {
      JSX: true,
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
    'react/prop-types': 'off',
    'react/jsx-curly-brace-presence': ['error', { children: 'never', props: 'never' }],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: false }],
    'react/jsx-uses-react': 'off',
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': 'error',
    // Basic React rules
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': ['error', { component: true, html: true }],

    'react-hooks/exhaustive-deps': 'warn',
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',

    'jsx-a11y/anchor-is-valid': 'error',
    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
    'jsx-a11y/img-redundant-alt': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'error',
  },
  settings: {
    formComponents: ['Form'],
    'jsx-a11y': {
      components: {
        Button: 'button',
        Input: 'input',
      },
    },
    linkComponents: [
      { name: 'Link', linkAttribute: 'to' },
      { name: 'NavLink', linkAttribute: 'to' },
    ],
    react: {
      version: 'detect',
    },
  },
};

// Testing-specific configuration
const reactTestingConfig: Linter.FlatConfig = {
  files: TEST_FILE_PATTERNS,
  plugins: {
    'jest-dom': jestDomPlugin,
    'testing-library': testingLibraryPlugin,
  },
  rules: {
    'testing-library/no-wait-for-side-effects': 'error',
    // Testing Library recommended rules
    'testing-library/await-async-queries': 'error',
    'testing-library/await-async-utils': 'error',
    'testing-library/no-await-sync-queries': 'error',
    'testing-library/no-container': 'error',
    'testing-library/no-debugging-utils': 'warn',
    'testing-library/no-dom-import': ['error', 'react'],
    'testing-library/no-node-access': 'warn',
    'testing-library/no-promise-in-fire-event': 'error',
    'testing-library/no-render-in-lifecycle': 'error',
    'testing-library/no-unnecessary-act': 'error',
    // 'testing-library/no-wait-for-empty-callback': 'error', // Rule doesn't exist in current version
    'testing-library/no-wait-for-multiple-assertions': 'error',
    'testing-library/prefer-find-by': 'error',
    'testing-library/prefer-presence-queries': 'error',
    'testing-library/prefer-query-by-disappearance': 'error',
    'testing-library/prefer-screen-queries': 'error',
    'testing-library/render-result-naming-convention': 'error',

    // Jest DOM recommended rules
    'jest-dom/prefer-checked': 'error',
    'jest-dom/prefer-empty': 'error',
    'jest-dom/prefer-enabled-disabled': 'error',
    'jest-dom/prefer-focus': 'error',
    'jest-dom/prefer-in-document': 'error',
    'jest-dom/prefer-required': 'error',
    'jest-dom/prefer-to-have-attribute': 'error',
    'jest-dom/prefer-to-have-class': 'error',
    'jest-dom/prefer-to-have-style': 'error',
    'jest-dom/prefer-to-have-text-content': 'error',
    'jest-dom/prefer-to-have-value': 'error',
  },
  settings: {
    'testing-library/custom-queries': ['findByTestId', 'getByTestId'],
    'testing-library/custom-renders': ['renderWithProviders'],
  },
};

// Cypress testing configuration
const cypressTestingConfig: Linter.FlatConfig = {
  files: CYPRESS_TEST_FILE_PATTERNS,
  ...cypressPlugin.configs.globals,
  plugins: {
    cypress: cypressPlugin,
  },
  rules: {
    'cypress/assertion-before-screenshot': 'error',
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-async-tests': 'error',
    'cypress/no-force': 'warn',
    // Core Cypress rules
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/require-data-selectors': ['warn', { allowCssSelectors: true }],
    'cypress/unsafe-to-chain-command': 'error',

    'jest-dom/prefer-in-document': 'off',
    // Disable conflicting rules for Cypress tests
    'testing-library/await-async-queries': 'off',
    'testing-library/prefer-screen-queries': 'off',
  },
};

const config: Linter.FlatConfig[] = [
  ...baseConfig,
  reactComponentConfig,
  reactTestingConfig,
  cypressTestingConfig,
];

export default config;
