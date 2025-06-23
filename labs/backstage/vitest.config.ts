import { defineConfig } from 'vitest/config';
import { nextPreset } from '@repo/testing/vitest/presets';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
      '@': path.resolve(dirname, './src'),
      '@repo': path.resolve(dirname, '../../packages'),
    },
  },
});
