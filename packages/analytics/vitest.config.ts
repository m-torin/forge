import path from 'path';
import { defineConfig } from 'vitest/config';
import { reactPreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...reactPreset,
  resolve: {
    ...reactPreset.resolve,
    alias: {
      ...reactPreset.resolve?.alias,
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    ...reactPreset.test,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test-utils/**',
        '**/mocks/**',
        '**/__tests__/**',
        'src/examples/**',
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
});
