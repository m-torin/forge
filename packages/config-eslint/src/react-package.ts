import type { Linter } from 'eslint';
import jestDomPlugin from 'eslint-plugin-jest-dom';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import testingLibraryPlugin from 'eslint-plugin-testing-library';

import baseConfig from './index';
import { createConfig, SEVERITY, type RulesRecord } from './types/config';

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

// React component files
const REACT_COMPONENT_FILES = ['**/*.jsx', '**/*.tsx'];

// Create typed plugin instances
const createReactPlugins = () => ({
  'jsx-a11y': jsxA11yPlugin,
  react: reactPlugin,
  'react-hooks': reactHooksPlugin,
});

const createTestingPlugins = () => ({
  'jest-dom': jestDomPlugin,
  'testing-library': testingLibraryPlugin,
});

// React component rules
const createReactRules = (): RulesRecord => ({
  // React Hooks rules
  'react-hooks/exhaustive-deps': SEVERITY.WARN,
  'react-hooks/rules-of-hooks': SEVERITY.ERROR,

  // JSX rules
  'react/jsx-curly-brace-presence': [SEVERITY.ERROR, { children: 'never', props: 'never' }],
  'react/jsx-fragments': [SEVERITY.ERROR, 'syntax'],
  'react/jsx-no-useless-fragment': [SEVERITY.ERROR, { allowExpressions: false }],
  'react/jsx-uses-react': SEVERITY.OFF,
  'react/self-closing-comp': [SEVERITY.ERROR, { component: true, html: true }],

  // Component rules
  'react/no-array-index-key': SEVERITY.WARN,
  'react/no-unstable-nested-components': SEVERITY.ERROR,
  'react/prop-types': SEVERITY.OFF,
  'react/react-in-jsx-scope': SEVERITY.OFF,
});

// Accessibility rules
const createA11yRules = (): RulesRecord => ({
  'jsx-a11y/alt-text': SEVERITY.ERROR,
  'jsx-a11y/anchor-has-content': SEVERITY.ERROR,
  'jsx-a11y/anchor-is-valid': SEVERITY.ERROR,
  'jsx-a11y/aria-props': SEVERITY.ERROR,
  'jsx-a11y/aria-role': [SEVERITY.ERROR, { ignoreNonDOM: true }],
  'jsx-a11y/img-redundant-alt': SEVERITY.ERROR,
  'jsx-a11y/no-noninteractive-element-interactions': SEVERITY.WARN,
  'jsx-a11y/no-static-element-interactions': SEVERITY.WARN,
  'jsx-a11y/role-has-required-aria-props': SEVERITY.ERROR,
});

// Jest DOM rules
const createJestDomRules = (): RulesRecord => ({
  'jest-dom/prefer-checked': SEVERITY.ERROR,
  'jest-dom/prefer-empty': SEVERITY.ERROR,
  'jest-dom/prefer-enabled-disabled': SEVERITY.ERROR,
  'jest-dom/prefer-focus': SEVERITY.ERROR,
  'jest-dom/prefer-in-document': SEVERITY.ERROR,
  'jest-dom/prefer-required': SEVERITY.ERROR,
  'jest-dom/prefer-to-have-attribute': SEVERITY.ERROR,
  'jest-dom/prefer-to-have-class': SEVERITY.ERROR,
  'jest-dom/prefer-to-have-style': SEVERITY.ERROR,
  'jest-dom/prefer-to-have-text-content': SEVERITY.ERROR,
  'jest-dom/prefer-to-have-value': SEVERITY.ERROR,
});

// Testing Library rules
const createTestingLibraryRules = (): RulesRecord => ({
  'testing-library/await-async-queries': SEVERITY.ERROR,
  'testing-library/await-async-utils': SEVERITY.ERROR,
  'testing-library/no-await-sync-queries': SEVERITY.ERROR,
  'testing-library/no-container': SEVERITY.ERROR,
  'testing-library/no-debugging-utils': SEVERITY.WARN,
  'testing-library/no-dom-import': [SEVERITY.ERROR, 'react'],
  'testing-library/no-node-access': SEVERITY.WARN,
  'testing-library/no-promise-in-fire-event': SEVERITY.ERROR,
  'testing-library/no-render-in-lifecycle': SEVERITY.ERROR,
  'testing-library/no-unnecessary-act': SEVERITY.ERROR,
  'testing-library/no-wait-for-multiple-assertions': SEVERITY.ERROR,
  'testing-library/no-wait-for-side-effects': SEVERITY.ERROR,
  'testing-library/prefer-find-by': SEVERITY.ERROR,
  'testing-library/prefer-presence-queries': SEVERITY.ERROR,
  'testing-library/prefer-query-by-disappearance': SEVERITY.ERROR,
  'testing-library/prefer-screen-queries': SEVERITY.ERROR,
  'testing-library/render-result-naming-convention': SEVERITY.ERROR,
});

// React settings
const createReactSettings = () => ({
  formComponents: ['Form'],
  'jsx-a11y': {
    components: {
      Button: 'button',
      Input: 'input',
    },
  },
  linkComponents: [
    { linkAttribute: 'to', name: 'Link' },
    { linkAttribute: 'to', name: 'NavLink' },
  ],
  react: {
    version: 'detect',
  },
});

// Testing settings
const createTestingSettings = () => ({
  'testing-library/custom-queries': ['findByTestId', 'getByTestId'],
  'testing-library/custom-renders': ['renderWithProviders'],
});

// Main configuration array
const config: Linter.FlatConfig[] = [
  ...baseConfig,

  // React component configuration
  createConfig({
    files: REACT_COMPONENT_FILES,
    languageOptions: {
      globals: {
        JSX: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: createReactPlugins(),
    rules: {
      ...createReactRules(),
      ...createA11yRules(),
    },
    settings: createReactSettings(),
  }),

  // Testing configuration
  createConfig({
    files: TEST_FILE_PATTERNS,
    plugins: createTestingPlugins(),
    rules: {
      ...createJestDomRules(),
      ...createTestingLibraryRules(),
    },
    settings: createTestingSettings(),
  }),
];

export default config;
