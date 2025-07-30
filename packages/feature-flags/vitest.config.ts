import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      coverage: {
        thresholds: {
          lines: 19,
          functions: 30,
          branches: 20,
          statements: 19,
        },
      },
    },
  },
});
