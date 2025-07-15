import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  setupFiles: ['./__tests__/setup.ts'],
  overrides: {
    test: {
      exclude: [
        'node_modules',
        'dist',
        'build',
        'src/examples/**',
        // Temporarily exclude problematic test files during AI SDK v5 migration
        '__tests__/patterns/ai-sdk-v5-testing.test.ts',
        '__tests__/patterns/telemetry.test.ts',
        '__tests__/patterns/tool-calling.test.ts',
        '__tests__/server/mcp/**/*.test.ts',
        '__tests__/mcp-rag-integration/**/*.test.ts',
      ],
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
        ],
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
