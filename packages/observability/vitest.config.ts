import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Use jsdom for React component tests
    environmentMatchGlobs: [
      ['**/__tests__/hooks/**', 'jsdom'],
      ['**/*.test.tsx', 'jsdom'],
    ],
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
