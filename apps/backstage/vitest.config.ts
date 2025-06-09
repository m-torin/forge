import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'], // Exclude E2E tests from Vitest
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
