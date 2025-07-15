import nextConfig from '@repo/eslint-config/next';

/**
 * ESLint configuration for ai-chatbot application
 * Extends Next.js config with test file overrides
 */
export default [
  ...nextConfig,
  // Override for Playwright test files to disable React Testing Library rules
  {
    files: ['__tests__/**/*.ts', '__tests__/**/*.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'testing-library/prefer-screen-queries': 'off',
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
      'testing-library/render-result-naming-convention': 'off',
      'playwright/expect-expect': 'off',
    },
  },
];
