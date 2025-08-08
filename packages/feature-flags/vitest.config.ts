import { createNodePackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createNodePackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
      environment: 'node',
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

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
