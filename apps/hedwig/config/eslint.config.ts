import baseConfig from '@repo/eslint-config/next';

export default [
  ...baseConfig,
  {
    ignores: ['babel.config.js', '.expo/**', 'expo-plugins/**', 'generated/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];