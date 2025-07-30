import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  overrides: {
    test: {
      coverage: {
        thresholds: {
          lines: 25,
          functions: 25,
          branches: 25,
          statements: 25,
        },
      },
    },
  },
});
