import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@repo/database': path.resolve(__dirname, '../database'),
      '@repo/database/prisma': path.resolve(__dirname, '../database/prisma'),
    },
  },
  test: {
    environment: 'jsdom',
    environmentMatchGlobs: [
      ['**/client*.test.{ts,tsx}', 'jsdom'],
      ['**/components/**/*.test.{ts,tsx}', 'jsdom'],
      ['**/*.test.tsx', 'jsdom'],
    ],
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
