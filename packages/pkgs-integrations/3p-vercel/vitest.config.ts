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
          'src/react.ts',
          'src/client*.ts',
          'src/server*.ts',
          'src/adapter.ts',
          'src/server-adapter.ts',
          'src/web-vitals.ts',
          'src/operations/**',
        ],
        thresholds: {
          lines: 60,
          functions: 45,
          branches: 60,
          statements: 60,
        },
      },
    },
  },
});
