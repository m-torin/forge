import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      include: ['**/*.{test,spec}.{ts,tsx}'],
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
