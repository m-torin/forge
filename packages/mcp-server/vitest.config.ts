import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  overrides: {
    test: {
      coverage: {
        exclude: [
          'node_modules/**',
          'dist/**',
          'coverage/**',
          '**/*.d.ts',
          'vitest.config.ts',
          'scripts/**',
          'bin/**',
          // Integration-heavy entrypoints or type/aggregate modules
          'src/server.ts',
          'src/runtime/**',
          'src/types/**',
          'src/utils/index.ts',
        ],
      },
    },
  },
});
