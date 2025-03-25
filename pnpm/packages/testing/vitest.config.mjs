import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/env/templates/**',
      '**/cypress/env/templates/**',
      '**/vitest/env/templates/**',
      '**/vitest/test-exports.test.ts',
    ],
  },
});
