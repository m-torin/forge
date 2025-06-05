import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      exclude: [
        'src/__tests__/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'node_modules/**',
        'dist/**',
      ],
      reporter: ['text', 'json', 'html'],
    },
  },
});
