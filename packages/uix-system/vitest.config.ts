import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  overrides: {
    test: {
      coverage: {
        thresholds: {
          lines: 1,
          functions: 1,
          branches: 1,
          statements: 1,
        },
      },
    },
  },
});

// Add vite-tsconfig-paths plugin to handle TypeScript path resolution
export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
