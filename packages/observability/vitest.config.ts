import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          // Add type-only files and directories
          '**/types/**',
          '**/*.d.ts',
          '**/shared/types/**',
          // Keep existing exclusions from base config
          '**/node_modules/**',
          '**/dist/**',
          '**/__tests__/**',
          '**/*.test.*',
          '**/*.spec.*',
        ],
        thresholds: {
          branches: 10,
          functions: 10,
          lines: 10,
          statements: 10,
        },
      },
    },
  },
});
