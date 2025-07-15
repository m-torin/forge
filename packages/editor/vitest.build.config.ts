import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'build-tests',
    environment: 'node',
    include: ['__tests__/build/**/*.test.{ts,tsx}'],
    setupFiles: ['__tests__/build/setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Test built packages, not source
    globals: false,
    testTimeout: 30000, // Build tests may take longer
  },
  resolve: {
    alias: {
      // Test the built packages
      '@repo/editor': resolve(__dirname, 'dist/index.js'),
      '@repo/editor/embeddable': resolve(__dirname, 'dist/standalone/embeddable-standalone.js'),
      '@repo/editor/react': resolve(__dirname, 'dist/react/react-bundle.js'),
      '@repo/editor/nextjs': resolve(__dirname, 'dist/nextjs/nextjs-bundle.js'),
    },
  },
});
