// index.ts
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import markdownPlugin from '@eslint/markdown';
import { resolve } from 'node:path';
import type { Linter } from 'eslint';

// Import plugins with type assertions to avoid TypeScript errors
// @ts-ignore
import importPlugin from 'eslint-plugin-import';
// @ts-ignore
import onlyWarn from 'eslint-plugin-only-warn';
// @ts-ignore
import securityPlugin from 'eslint-plugin-security';
// @ts-ignore
import promisePlugin from 'eslint-plugin-promise';
// @ts-ignore
import perfectionistPlugin from 'eslint-plugin-perfectionist';
// @ts-ignore
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const project = resolve(process.cwd(), 'tsconfig.json');

// Common sort order configuration for perfectionist rules
const perfectionistSortConfig = {
  type: 'natural',
  order: 'asc',
  ignoreCase: true,
} as const;

// File patterns
const MARKDOWN_FILES = ['**/*.md'];
const MARKDOWN_CODE_BLOCKS = ['**/*.md/*.{js,jsx,ts,tsx}'];

const config: Linter.FlatConfig[] = [
  // Base ESLint recommended rules
  js.configs.recommended,

  // Markdown configuration
  ...markdownPlugin.configs.recommended,
  {
    files: MARKDOWN_FILES,
    processor: 'markdown/markdown',
    language: 'markdown/gfm',
    rules: {
      'markdown/fenced-code-language': ['error', { allowEmpty: false }],
      'markdown/no-html': 'warn',
      'markdown/no-duplicate-headings': 'error',
    },
  },
  {
    files: MARKDOWN_CODE_BLOCKS,
    rules: {
      // Relax rules for documentation examples
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-unresolved': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },

  // TypeScript ESLint recommended rules
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Security Plugin recommended rules - with overrides
  {
    ...securityPlugin.configs.recommended,
    rules: {
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
    },
  },

  // Promise Plugin flat/recommended rules
  promisePlugin.configs['flat/recommended'],

  // JavaScript-specific configuration
  {
    // Match all JavaScript files (not TypeScript)
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],

    // Standard ignores plus build artifacts
    ignores: [
      '.*',
      'node_modules/**',
      'dist/**',
      'build/**',
      '.cache/**',
      'coverage/**',
      '**/*.min.js',
      '**/*.css',
      '.eslintrc.js',
    ],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
      noInlineConfig: false,
    },

    // Configure all shared plugins
    plugins: {
      import: importPlugin,
      'only-warn': onlyWarn,
      security: securityPlugin,
      promise: promisePlugin,
      perfectionist: perfectionistPlugin,
      'unused-imports': unusedImportsPlugin,
    },
  },

  // TypeScript-specific configuration with rules
  {
    // Match all TypeScript files
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],

    // Standard ignores plus build artifacts
    ignores: [
      '.*',
      'node_modules/**',
      'dist/**',
      'build/**',
      '.cache/**',
      'coverage/**',
      '**/*.min.js',
      '**/*.css',
      '.eslintrc.js',
    ],

    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
      noInlineConfig: false,
    },

    // Configure all shared plugins
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'only-warn': onlyWarn,
      security: securityPlugin,
      promise: promisePlugin,
      perfectionist: perfectionistPlugin,
      'unused-imports': unusedImportsPlugin,
    },

    // TypeScript-aware import resolution
    settings: {
      'import/resolver': {
        typescript: {
          project,
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.mjs', '.cjs'],
          moduleDirectory: ['node_modules', '../../node_modules'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'],
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
      'import/internal-regex': '^@repo/',
    },

    rules: {
      // TypeScript-specific rules (that aren't already in the recommended/stylistic presets)
      '@typescript-eslint/no-explicit-any': 'warn', // Override from recommended which has it as 'error'
      '@typescript-eslint/no-unused-vars': 'off', // Explicitly disable as we use unused-imports instead
      '@typescript-eslint/no-empty-function': [
        'warn',
        { allow: ['arrowFunctions'] },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': 'allow-with-description' },
      ],

      // Security rules
      'security/detect-object-injection': 'off', // Disable object injection warning (too many false positives)

      // Unused imports - better handling with auto-fix
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Import organization and validation (non-sorting rules)
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-unresolved': 'error',
      'import/order': 'off', // Explicitly disable as we use perfectionist instead

      // Perfectionist sorting rules - each serves a unique purpose

      // 1. Import sorting - handles the overall file imports
      'perfectionist/sort-imports': [
        'error',
        {
          ...perfectionistSortConfig,
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
            'unknown',
          ],
          newlinesBetween: 'always',
          internalPattern: ['^@repo/'],
        },
      ],

      // 2. Object property sorting
      'perfectionist/sort-objects': [
        'error',
        {
          ...perfectionistSortConfig,
          partitionByNewLine: true,
          customGroups: {
            id: 'id',
            name: 'name',
            type: 'type',
            url: 'url',
          },
          groups: ['id', 'name', 'type', 'url', 'unknown'],
        },
      ],

      // 3. TypeScript interface and type sorting
      'perfectionist/sort-interfaces': [
        'error',
        {
          ...perfectionistSortConfig,
          partitionByNewLine: true,
        },
      ],

      // 4. Enum sorting
      'perfectionist/sort-enums': ['error', perfectionistSortConfig],

      // 5. Named imports sorting - explicitly handles the imports within curly braces
      'perfectionist/sort-named-imports': ['error', perfectionistSortConfig],

      // 6. Named exports sorting
      'perfectionist/sort-named-exports': ['error', perfectionistSortConfig],

      // 7. JSX props sorting
      'perfectionist/sort-jsx-props': [
        'error',
        {
          ...perfectionistSortConfig,
          customGroups: {
            key: 'key',
            id: 'id',
            ref: 'ref',
            callback: ['on*', 'handle*'],
            styling: ['style', 'className', 'class', 'classes', 'sx'],
          },
          groups: ['key', 'id', 'ref', 'callback', 'styling', 'unknown'],
        },
      ],

      // 8. Array sorting if needed
      'perfectionist/sort-array-includes': [
        'warn', // Only warn as this may not always be desirable
        perfectionistSortConfig,
      ],
    },
  },

  // Must be last to properly disable any style rules that conflict with Prettier
  eslintConfigPrettier,
];

export default config;
