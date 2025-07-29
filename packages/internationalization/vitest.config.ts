import { createReactPackageConfig } from '@repo/qa/vitest/configs';

export default createReactPackageConfig({
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
          lines: 40,
          functions: 40,
          branches: 40,
          statements: 40,
        },
      },
    },
  },
});
