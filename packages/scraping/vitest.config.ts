import { defineConfig } from 'vitest/config';
import { nodePreset } from '@repo/testing/vitest-presets';

export default defineConfig({
  ...nodePreset,
  test: {
    ...nodePreset.test,
    coverage: {
      ...nodePreset.test?.coverage,
      exclude: [
        'src/__tests__/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'node_modules/**',
        'dist/**',
      ],
    },
  },
});
