import { defineConfig } from 'vitest/config';
import { nextPreset } from '@repo/testing/vitest-presets';
import path from 'node:path';

export default defineConfig({
  ...nextPreset,
  test: {
    ...nextPreset.test,
    setupFiles: ['./test-setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'], // Exclude E2E tests from Vitest
  },
  resolve: {
    ...nextPreset.resolve,
    alias: {
      ...nextPreset.resolve?.alias,
      '@': path.resolve(__dirname, './'),
    },
  },
});
