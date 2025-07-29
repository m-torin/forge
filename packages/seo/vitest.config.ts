import { createReactPackageConfig } from '@repo/qa/vitest/configs';

export default createReactPackageConfig({
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
        thresholds: {
          branches: 15,
          functions: 15,
          lines: 15,
          statements: 15,
        },
      },
    },
  },
});
