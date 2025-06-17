/// <reference path="./types/eslint-plugins.d.ts" />

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import promisePlugin from 'eslint-plugin-promise';
import securityPlugin from 'eslint-plugin-security';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

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
  // Security rules
  'security/detect-buffer-noassert': 'error',
  'security/detect-child-process': 'error',
  'security/detect-eval-with-expression': 'error',
  'security/detect-object-injection': 'off', // Too many false positives
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
};

const config: Linter.FlatConfig[] = [
  // Note: Perfectionist plugin configs causing issues - using manual rules instead

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
    rules: {
      // Relax rules for tests
      'no-console': 'off',
      'security/detect-object-injection': 'off',
      'perfectionist/sort-objects': 'off', // Allow unsorted objects in tests
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
  // 9. PRETTIER - MUST BE LAST!
  // ============================================
  eslintConfigPrettier,
];

export default config;
