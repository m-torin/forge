import { createQStashPackageConfig } from '@repo/qa/vitest/configs';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default createQStashPackageConfig({
  setupFiles: ['./__tests__/setup/test-env.ts'],
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
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
