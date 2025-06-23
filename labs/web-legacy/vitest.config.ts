import { defineConfig } from 'vitest/config';
import { nextPreset } from '@repo/testing/vitest/presets';
import path from 'node:path';

export default defineConfig({
  ...nextPreset,
  test: {
    ...nextPreset.test,
    setupFiles: [],
  },
  resolve: {
    ...nextPreset.resolve,
    alias: {
      ...nextPreset.resolve?.alias,
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
});
