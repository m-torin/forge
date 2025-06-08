import { resolve } from 'node:path';

/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@repo/analytics': resolve(__dirname, '../analytics'),
      '@repo/design-system': resolve(__dirname, './'),
      '@repo/notifications': resolve(__dirname, '../notifications'),
      geist: resolve(__dirname, './mocks/geist.ts'),
      'geist/font/mono': resolve(__dirname, './mocks/geist-mono.ts'),
      'geist/font/sans': resolve(__dirname, './mocks/geist-sans.ts'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      exclude: ['node_modules/', '**/*.config.*', '**/*.d.ts', '__tests__/**'],
      reporter: ['text', 'json', 'html'],
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
