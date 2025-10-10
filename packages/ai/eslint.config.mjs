 
import packageConfig from '@repo/eslint-config/package';

export default [
  {
    ignores: ['dist/**/*', 'src/examples/**/*', 'examples/**/*'],
  },
  ...packageConfig,
  {
    files: ['__tests__/**/*'],
    rules: {
      // Allow test-specific patterns
      'vitest/no-conditional-in-test': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/prefer-strict-equal': 'off',
      'vitest/no-commented-out-tests': 'off',
      'vitest/require-to-throw-message': 'off',
      'promise/no-promise-in-callback': 'off',
    },
  },
  {
    rules: {
      'unused-imports/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'promise/prefer-await-to-then': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/no-array-index-key': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-regexp': 'off',
    },
  },
];
