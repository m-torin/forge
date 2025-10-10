import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  overrides: {
    test: {
      coverage: {
        exclude: [
          'node_modules/**',
          'dist/**',
          '**/*.d.ts',
          'src/types.ts',
          'src/client*.ts',
          'src/server*.ts',
          'src/operations/**',
        ],
        thresholds: {
          lines: 85,
          functions: 80,
          branches: 55,
          statements: 85,
        },
      },
    },
  },
});
