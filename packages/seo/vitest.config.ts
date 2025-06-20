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
      'server-only': path.resolve(__dirname, './test-mocks/server-only.js'),
    },
  },
  test: {
    ...reactPreset.test,
    setupFiles: ['./test-setup.ts'],
  },
});
