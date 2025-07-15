// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      'README.md', // Ignore README.md file to prevent parsing errors in markdown code blocks
      '**/*.md', // Ignore all markdown files
    ],
  },
  ...reactConfig,
  {
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['__tests__/**/*.ts', '__tests__/**/*.tsx'],
    rules: {
      // Allow test factory patterns and complex test structures
      'vitest/no-standalone-expect': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/no-conditional-tests': 'off',
      'vitest/no-conditional-in-test': 'off',
      'vitest/expect-expect': 'off',
      'vitest/require-to-throw-message': 'off',
      'vitest/prefer-strict-equal': 'off',
      'promise/param-names': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-non-literal-regexp': 'off',
      'testing-library/no-node-access': 'off',
    },
  },
];

export default config;
