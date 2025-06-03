// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

// @ts-ignore - eslint doesn't have type definitions
import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      'hooks/use-mobile.tsx',
      '**/__tests__/**/*',
      'setup-tests.ts',
      'README.md',
      '**/*.md',
      '**/*.mdx',
      'vitest.setup.ts',
    ],
  },
  ...reactConfig,
  {
    // Disable TypeScript project checking for files not in tsconfig
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: false, // Disable project-wide type checking to avoid tsconfig issues
      },
    },
    rules: {
      // Disable problematic rules for design-system
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];

export default config;
