import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@repo': path.resolve(__dirname, '../../packages'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test-setup.ts'],
  },
});
