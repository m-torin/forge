// eslint.config.ts
import baseConfig from '@repo/eslint-config';

import type { Linter } from 'eslint';

// Create a new configuration that extends the base config
// and adds our custom ignore pattern for markdown files
const config: Linter.FlatConfig[] = [
  {
    ignores: ['**/*.md'],
  },
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disable type-aware rule
    },
  },
  {
    files: ['**/*.type.test.ts', '**/type-testing.ts'],
    rules: {
      'vitest/expect-expect': 'off', // Type tests use expectTypeOf, not expect
    },
  },
  {
    files: [
      'src/vitest/mocks-packages/**/*.ts',
      'src/vitest/setup/**/*.ts',
      'src/vitest/utils/**/*.ts',
    ],
    rules: {
      'promise/prefer-await-to-then': 'off', // Mock implementations may need .then()
      'promise/always-return': 'off', // Mock implementations may not return
      'promise/no-callback-in-promise': 'off', // Mock implementations may use callbacks
    },
  },
];

export default config;
