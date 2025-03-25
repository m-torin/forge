import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setup-tests.ts'],
    exclude: [
      '**/node_modules/**',
      // Exclude problematic test files that cause esbuild errors
      '**/.react-email/src/utils/get-email-component.spec.ts',
      // Exclude test with path issues
      '**/.react-email/src/utils/get-emails-directory-metadata.spec.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
