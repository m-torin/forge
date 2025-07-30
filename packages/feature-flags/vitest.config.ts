import { createNodePackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createNodePackageConfig({
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
