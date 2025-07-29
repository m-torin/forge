import baseConfig from '@repo/eslint-config';

export default [
  ...baseConfig,
  {
    rules: {
      'no-useless-catch': 'warn', // Downgrade to warning for API integration patterns
    },
  },
];
