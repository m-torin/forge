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
];

export default config;
