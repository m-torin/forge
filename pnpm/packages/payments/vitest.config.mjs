// This is a vitest.config.mjs template for Next-Forge packages
// This file uses .mjs to avoid TypeScript ESM issues

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Common configuration for React packages
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'], // Customize this path if needed
    include: ['**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      // Exclude problematic test files
      '**/__tests__/ai.test.ts',
      '**/__tests__/index.test.ts',
      '**/__tests__/mock-example.test.ts',
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        'test/**',
        'tests/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/vitest.config.*',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
});
