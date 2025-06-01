import baseConfig from '@repo/eslint-config/next';

export default [
  ...baseConfig,
  {
    ignores: ['babel.config.js', '.expo/**', 'expo-plugins/**', 'generated/**', '*.generated.*', '**/__tests__/**', '**/*.test.*', '**/*.spec.*', 'vitest.config.*', 'vitest.setup.*'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
];