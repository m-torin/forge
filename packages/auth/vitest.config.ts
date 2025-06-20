import { defineConfig } from 'vitest/config';
import { reactPreset } from '@repo/testing/vitest/presets';
import path from 'path';

export default defineConfig({
  ...reactPreset,
  resolve: {
    ...reactPreset.resolve,
    alias: {
      ...reactPreset.resolve?.alias,
      '@': path.resolve(__dirname, './src'),
      '@repo/database': path.resolve(__dirname, '../database'),
      '@repo/database/prisma': path.resolve(__dirname, '../database/prisma'),
      // Map relative imports from tests to src directory
      '../client': path.resolve(__dirname, './src/client'),
      '../server': path.resolve(__dirname, './src/server'),
      '../server/auth': path.resolve(__dirname, './src/server'),
      '../shared': path.resolve(__dirname, './src/shared'),
      '../components': path.resolve(__dirname, './src/client'),
    },
  },
  test: {
    ...reactPreset.test,
    setupFiles: ['./__tests__/setup.ts'],
  },
});
