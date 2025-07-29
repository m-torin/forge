import { createQStashPackageConfig } from '@repo/qa/vitest/configs';

export default createQStashPackageConfig({
  setupFiles: ['./__tests__/setup/test-env.ts'],
  overrides: {
    test: {
      testTimeout: 30000,
      hookTimeout: 30000,
      include: ['**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        exclude: [
          'node_modules/**',
          'dist/**',
          'coverage/**',
          '**/*.d.ts',
          '**/__tests__/**',
          '**/*.test.*',
          '**/*.config.*',
          '**/vitest.*.ts',
        ],
        include: ['src/**/*.{ts,js}'],
      },
    },
  },
});
