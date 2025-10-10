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
          'src/destinations/**',
          'src/operations/**',
        ],
        thresholds: {
          lines: 65,
          functions: 40,
          branches: 55,
          statements: 65,
        },
      },
    },
  },
});
