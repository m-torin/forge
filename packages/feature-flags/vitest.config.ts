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
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
