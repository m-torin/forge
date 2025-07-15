import baseConfig from '@repo/eslint-config/react-package';

export default [
  ...baseConfig,
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['env.ts'],
    rules: {
      'no-console': 'off', // Allow console in env validation
    },
  },
];
