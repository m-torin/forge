import { createNodePackageConfig } from '@repo/qa/vitest/configs';
import { resolve } from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createNodePackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      globals: true,
    },
    resolve: {
      alias: {
        '#/root/*': resolve(process.cwd(), './*'),
        '#/*': resolve(process.cwd(), './src/*'),
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
