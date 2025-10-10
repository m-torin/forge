/**
 * Vitest Configuration for Accessibility Testing
 *
 * Specialized configuration for accessibility-focused tests with
 * @testing-library/jest-dom integration and enhanced DOM testing.
 */

import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Test files for accessibility tests only
    include: ['__tests__/accessibility/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '__tests__/visual-regression/**',
      '__tests__/unit/**',
    ],

    // Setup files
    setupFiles: ['__tests__/vitest-a11y-setup.ts'],

    // Globals for jest-dom matchers
    globals: true,

    // Reporter configuration for accessibility testing
    reporters: ['verbose', 'json', 'html'],

    outputFile: {
      json: 'test-results/accessibility-results.json',
      html: 'test-results/accessibility-report.html',
    },

    // Coverage settings for accessibility testing
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage/accessibility',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.{ts,tsx}', 'src/**/*.test.{ts,tsx}', 'src/**/index.{ts,tsx}'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Timeout settings for accessibility tests
    testTimeout: 10000,
    hookTimeout: 10000,

    // Mock and stub configuration
    clearMocks: true,
    restoreMocks: true,

    // Accessibility-specific test context
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Accessibility tests can be sensitive to timing
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ESBuild configuration for JSX
  esbuild: {
    jsx: 'automatic',
  },

  // Define for environment variables
  define: {
    'process.env.NODE_ENV': '"test"',
    __TEST_ENVIRONMENT__: '"accessibility"',
  },
});
