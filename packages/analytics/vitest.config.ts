import { createReactPackageConfig } from '@repo/qa/vitest/configs';

export default createReactPackageConfig({
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
