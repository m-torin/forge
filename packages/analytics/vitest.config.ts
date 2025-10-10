import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  setupFiles: ['./__tests__/setup.ts'],
  overrides: {
    test: {
      exclude: ['node_modules', 'dist', 'build', 'src/examples/**'],
      coverage: {
        exclude: [
          'coverage/**',
          'dist/**',
          '**/*.d.ts',
          '**/__tests__/**',
          '**/*.test.*',
          '**/*.spec.*',
          '**/test-utils.*',
          '**/setup.*',
          '**/mocks/**',
          'src/examples/**',
          // Exclude environment-specific integration surfaces and pure type modules
          'src/next/**',
          'src/client/next/**',
          'src/server/next.ts',
          'src/providers/**/server.ts',
          'src/providers/**/types.ts',
          'src/shared/types/**',
          'src/types/**',
        ],
        // Analytics is a complex multi-provider package with conditional code paths
        // Setting thresholds appropriate for complex packages (per CLAUDE.md guidelines)
        // Current coverage: 29.3% lines/statements, 81.2% branches, 53.87% functions
        thresholds: {
          lines: 29,
          functions: 50,
          branches: 80,
          statements: 29,
        },
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
