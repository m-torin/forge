import nextConfig from '@repo/eslint-config/next';

export default [
  ...nextConfig,
  {
    ignores: ['**/components/ui/**'], // shadcn/ui components
  },
  {
    files: ['__tests__/**/*.{ts,tsx}'],
    rules: {
      'testing-library/prefer-screen-queries': 'off',
      'playwright/no-conditional-in-test': 'off',
      'playwright/expect-expect': 'off',
      'playwright/prefer-strict-equal': 'off',
    },
  },
];
