import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/e2e/**'], // Exclude E2E tests from Vitest
    globals: true,
  },
});
