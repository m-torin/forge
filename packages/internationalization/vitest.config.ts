import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
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
        thresholds: {
          lines: 10,
          functions: 10,
          branches: 10,
          statements: 10,
        },
      },
    },
  },
});
