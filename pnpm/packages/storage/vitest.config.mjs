// This is the vitest.config.mjs for the storage package
import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Common configuration for the package
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
});
