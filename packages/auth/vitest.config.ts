import { defineConfig } from 'vitest/config';
import { reactPreset } from '@repo/testing/vitest-presets';
import path from 'path';

export default defineConfig({
  ...reactPreset,
  resolve: {
    ...reactPreset.resolve,
    alias: {
      ...reactPreset.resolve?.alias,
      '@': path.resolve(__dirname, './'),
      '@repo/database': path.resolve(__dirname, '../database'),
      '@repo/database/prisma': path.resolve(__dirname, '../database/prisma'),
    },
  },
  test: {
    ...reactPreset.test,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
