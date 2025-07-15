import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  excludePaths: ['__tests__/e2e/**', '**/*.spec.ts'], // Exclude Playwright tests
  coverageExclude: ['**/*.mdx', '**/*.md', '__tests__/e2e/**'],
  overrides: {
    test: {
      include: ['src/**/*.{test,spec}.{ts,tsx}', '__tests__/**/*.test.{ts,tsx}'],
      exclude: ['__tests__/e2e/**', '**/*.spec.ts'],
      coverage: {
        thresholds: {
          lines: 60,
          functions: 60,
          branches: 60,
          statements: 60,
        },
      },
    },
  },
});
