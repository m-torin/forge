import { defineConfig } from 'vitest/config';
import path from 'node:path';
import react from '@vitejs/plugin-react';

// If this import fails, make sure @repo/testing is installed
import { createVitestConfig } from '@repo/testing';

// Default configuration - use createVitestConfig() to generate a config with the right defaults
// or just use this as a template for your own configuration
export default defineConfig({
  plugins: [
    // Add React support for .tsx files
    react(),
  ],

  test: {
    // Utilize the Node.js environment for testing
    environment: 'node',

    // Enable global test variables (describe, it, etc.)
    globals: true,

    // Configure test file patterns
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },

  // Resolve aliases for imports
  resolve: {
    alias: {
      // Adjust these to match your project structure
      '@': path.resolve(__dirname, './src'),
      '@/tests': path.resolve(__dirname, './__tests__'),
    },
  },
});
