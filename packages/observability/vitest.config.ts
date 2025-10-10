import { createNodePackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createNodePackageConfig({
  setupFiles: ['./__tests__/setup.ts'],
  overrides: {},
});

// Add vite-tsconfig-paths plugin to handle TypeScript path resolution
export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
