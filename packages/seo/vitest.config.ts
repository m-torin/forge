import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      include: ['**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/*.d.ts',
          '**/test-setup.ts',
          '**/examples/**', // Exclude example files from coverage
        ],
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
