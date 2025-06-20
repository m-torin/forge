import path from 'path';
import { defineConfig } from 'vitest/config';
import { reactPreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...reactPreset,
  resolve: {
    ...reactPreset.resolve,
    alias: {
      ...reactPreset.resolve?.alias,
      '@': path.resolve(__dirname, './'),
      '@repo': path.resolve(__dirname, '../../packages'),
    },
  },
  test: {
    ...reactPreset.test,
    setupFiles: ['./test-setup.ts'],
  },
});
