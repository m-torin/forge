import baseConfig from '@repo/eslint-config/react-package';

// Feature flags package specific overrides
const config = [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off', // Allow console.log in development package
      'testing-library/no-wait-for-multiple-assertions': 'off', // Allow for complex testing scenarios
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
      'vitest/prefer-hooks-on-top': 'off',
      'vitest/prefer-hooks-in-order': 'off',
    },
  },
  {
    files: ['env.ts'],
    rules: {
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    files: ['src/client/**/*.tsx'],
    rules: {
      // Allow .then() for React hooks that need fire-and-forget promises
      'promise/prefer-await-to-then': 'off',
    },
  },
];

export default config;
