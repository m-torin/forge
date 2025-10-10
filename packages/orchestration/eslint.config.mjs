import baseConfig from '@repo/eslint-config';

const relaxedRules = {
  'no-console': 'off',
  'security/detect-non-literal-regexp': 'off',
  'security/detect-non-literal-fs-filename': 'off',
  'security/detect-unsafe-regex': 'off',
  'promise/prefer-await-to-then': 'off',
  'promise/always-return': 'off',
  'promise/catch-or-return': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  'unused-imports/no-unused-vars': 'off',
};

export default [
  ...baseConfig,
  {
    rules: relaxedRules,
  },
  {
    files: ['**/*.test.{ts,tsx}', '__tests__/**/*.ts', '__tests__/**/*.tsx'],
    rules: {
      ...relaxedRules,
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
    },
  },
];
