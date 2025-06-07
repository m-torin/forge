import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@repo/database': path.resolve(__dirname, '../database/prisma/index.ts'),
      '@repo/database/prisma': path.resolve(__dirname, '../database/prisma/index.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
