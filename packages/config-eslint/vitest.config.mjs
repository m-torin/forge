// This is a vitest.config.mjs template for Forge packages
// This file uses .mjs to avoid TypeScript ESM issues

import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Common configuration for non-React packages
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'], // Customize this path if needed
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**'],
    testTimeout: 10000,
    hookTimeout: 10000,

    // Skip esbuild transformation for tests
    deps: {
      interopDefault: true,
      inline: [/@repo\/.*/],
    },

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
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
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
