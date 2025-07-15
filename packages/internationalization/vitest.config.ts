import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      include: ['**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        exclude: [
          'node_modules/**',
          'dist/**',
          'coverage/**',
          '**/*.d.ts',
          '**/vite/**',
          '**/dynamic-import-helper.js',
        ],
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
