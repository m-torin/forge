import baseConfig from '@repo/eslint-config';

export default [
  ...baseConfig,
  {
    files: ['**/*.test.{ts,tsx}', '__tests__/**/*.ts', '__tests__/**/*.tsx'],
    rules: {
      // Allow test factory patterns and complex test structures
      'vitest/no-standalone-expect': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/no-conditional-tests': 'off',
      'vitest/no-conditional-in-test': 'off',
      'vitest/expect-expect': 'off',
      'vitest/require-to-throw-message': 'off',
      'vitest/prefer-strict-equal': 'off',
      'vitest/valid-title': 'off',
      'vitest/valid-describe-callback': 'off',
      'vitest/prefer-hooks-in-order': 'off',
      'promise/param-names': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-regexp': 'off',
    },
  },
];
