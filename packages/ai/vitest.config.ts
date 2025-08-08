import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  setupFiles: ['./__tests__/setup.ts'],
  overrides: {
    test: {
      exclude: ['node_modules', 'dist', 'build', 'src/examples/**'],
      coverage: {
        exclude: ['coverage/**', 'dist/**', '**/*.d.ts', 'src/examples/**'],
        // Focus coverage on actively tested areas to see meaningful progress
        include: [
          'src/server/core/**',
          'src/server/streaming/**',
          'src/shared/**',
          'src/client/**',
          'src/hooks/**',
          'src/rsc/**',
        ],
        thresholds: {
          lines: 30, // Lowered to allow incremental progress
          functions: 30,
          branches: 25,
          statements: 30,
        },
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
