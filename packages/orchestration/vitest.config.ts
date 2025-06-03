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
    name: 'orchestration',
    clearMocks: true,
    coverage: {
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/types.ts', 'src/**/index.ts'],
      include: ['src/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 60,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    environment: 'node',
    globals: true,
    hookTimeout: 10000,
    setupFiles: [],
    testTimeout: 15000,
  },
});
