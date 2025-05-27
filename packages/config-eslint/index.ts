import fs from 'node:fs';
import path from 'node:path';

// index.ts
import js from '@eslint/js';
import markdownPlugin from '@eslint/markdown';
import eslintConfigPrettier from 'eslint-config-prettier';
// Import plugins with type assertions to avoid TypeScript errors
// @ts-ignore
import importPlugin from 'eslint-plugin-import';
// @ts-ignore
import onlyWarn from 'eslint-plugin-only-warn';
// @ts-ignore
import perfectionistPlugin from 'eslint-plugin-perfectionist';
// @ts-ignore
import promisePlugin from 'eslint-plugin-promise';
// @ts-ignore
import securityPlugin from 'eslint-plugin-security';
// @ts-ignore
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import type { Linter } from 'eslint';

// Try to find tsconfig.json in current directory or parent directories
const findTsConfig = (): string | undefined => {
  try {
    const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      return tsConfigPath;
    }
    // If not found, try parent directories
    let currentDir = process.cwd();
    for (let i = 0; i < 5; i++) {
      currentDir = path.dirname(currentDir);
      const parentTsConfig = path.join(currentDir, 'tsconfig.json');
      if (fs.existsSync(parentTsConfig)) {
        return parentTsConfig;
      }
    }
  } catch {
    // Ignore errors
  }
  return undefined;
};

const project = findTsConfig();

// Common sort order configuration for perfectionist rules
const perfectionistSortConfig = {
  type: 'natural',
  ignoreCase: true,
  order: 'asc',
} as const;

// File patterns
const MARKDOWN_FILES = ['**/*.md'];
const MARKDOWN_CODE_BLOCKS = [
  '**/*.md/*.{js,jsx,ts,tsx}',
  '**/README.md/*.{js,jsx,ts,tsx}',
  '**/README.md/[0-9]*_[0-9]*.ts',
];

const config: Linter.FlatConfig[] = [
  // Base ESLint recommended rules
  js.configs.recommended,

  // Markdown configuration
  ...markdownPlugin.configs.recommended,
  {
    files: MARKDOWN_FILES,
    language: 'markdown/gfm',
    processor: 'markdown/markdown',
    rules: {
      'markdown/fenced-code-language': 'error',
      'markdown/no-duplicate-headings': 'error',
      'markdown/no-html': 'warn',
    },
  },
  {
    files: MARKDOWN_CODE_BLOCKS,
    languageOptions: {
      parserOptions: {
        project: null, // Disable TypeScript project configuration for markdown files
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-unresolved': 'off',
      // Relax rules for documentation examples
      'no-console': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },

  // TypeScript ESLint recommended rules
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Security Plugin recommended rules - with overrides
  {
    ...securityPlugin.configs.recommended,
    rules: {
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-unsafe-regex': 'error',
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
      '**/coverage/**', // Add explicit pattern to ignore all coverage directories in all packages
      '**/*.min.js',
      '**/*.css',
      '.eslintrc.js',
    ],

    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
    },

    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
    },

    // Configure all shared plugins
    plugins: {
      import: importPlugin,
      'only-warn': onlyWarn,
      perfectionist: perfectionistPlugin,
      promise: promisePlugin,
      security: securityPlugin,
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
      '**/coverage/**', // Add explicit pattern to ignore all coverage directories in all packages
      '**/*.min.js',
      '**/*.css',
      '.eslintrc.js',
    ],

    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ...(project && { project }),
      },
      sourceType: 'module',
    },

    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
    },

    // Configure all shared plugins
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'only-warn': onlyWarn,
      perfectionist: perfectionistPlugin,
      promise: promisePlugin,
      security: securityPlugin,
      'unused-imports': unusedImportsPlugin,
    },

    // TypeScript-aware import resolution
    settings: {
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
      'import/internal-regex': '^@repo/',
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'],
      },
      'import/resolver': {
        ...(project
          ? {
              typescript: {
                alwaysTryTypes: true,
                project,
              },
            }
          : {}),
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts', '.mjs', '.cjs'],
          moduleDirectory: ['node_modules', '../../node_modules'],
        },
      },
    },

    rules: {
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-empty-function': ['warn', { allow: ['arrowFunctions'] }],
      // TypeScript-specific rules (that aren't already in the recommended/stylistic presets)
      '@typescript-eslint/no-explicit-any': 'warn', // Override from recommended which has it as 'error'
      '@typescript-eslint/no-unused-vars': 'off', // Explicitly disable as we use unused-imports instead
      '@typescript-eslint/await-thenable': 'off', // Disable rule that requires type checking

      // Security rules
      'security/detect-object-injection': 'off', // Disable object injection warning (too many false positives)

      // Unused imports - better handling with auto-fix
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],

      // Import organization and validation (non-sorting rules)
      'import/first': 'error',
      'import/no-cycle': 'off', // Temporarily disabled due to resolver issues
      'import/no-duplicates': 'off', // Temporarily disabled due to resolver issues
      'import/no-unresolved': 'off', // Temporarily disabled due to resolver issues
      'import/no-useless-path-segments': 'off', // Temporarily disabled due to resolver issues
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
          internalPattern: ['^@repo/'],
          newlinesBetween: 'always',
        },
      ],

      // 2. Object property sorting
      'perfectionist/sort-objects': [
        'error',
        {
          ...perfectionistSortConfig,
          customGroups: {
            id: 'id',
            name: 'name',
            type: 'type',
            url: 'url',
          },
          groups: ['id', 'name', 'type', 'url', 'unknown'],
          partitionByNewLine: true,
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
            id: 'id',
            callback: ['on*', 'handle*'],
            key: 'key',
            ref: 'ref',
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
