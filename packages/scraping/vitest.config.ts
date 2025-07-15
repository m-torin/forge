import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      coverage: {
        thresholds: {
          lines: 25,
          functions: 40,
          branches: 40,
          statements: 25,
        },
      },
    },
  },
});
