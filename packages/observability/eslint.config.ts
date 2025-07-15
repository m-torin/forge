import baseConfig from '@repo/eslint-config';

export default [
  ...baseConfig,
  {
    rules: {
      // Allow console logging in observability package since it's used for debugging and fallback logging
      'no-console': 'off',
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
    },
  },
  {
    files: ['src/factory/**/*.ts'],
    rules: {
      // Allow .catch() for fire-and-forget promises in factory
      'promise/prefer-await-to-then': 'off',
    },
  },
];
