import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.mjs'],
    coverage: {
      provider: 'v8',
      reporter: process.env.CI ? ['text', 'json'] : ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.mjs',
        'bin/',
        '__tests__/setup.mjs'
      ]
    }
  }
});