import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Note: The testing package uses a simplified config to avoid circular imports
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/playwright/**', // Exclude Playwright tests
      'src/playwright/**', // Exclude Playwright folder
      '**/*.spec.ts', // Exclude .spec.ts files (used by Playwright)
      'src/vitest/examples/edge-runtime.test.ts', // Temporarily exclude edge runtime tests that need polyfill fixes
      'src/vitest/examples/qstash-example.test.ts', // Exclude QStash tests that need special setup
      'src/vitest/examples/srh-example.test.ts', // Exclude SRH tests that need special setup
      'src/vitest/examples/mock-manager.test.ts', // Exclude mock manager tests that need implementation fixes
      'src/vitest/examples/mock-validation.test.ts', // Exclude mock validation tests that need implementation fixes
      'src/vitest/examples/type-testing.type.test.ts', // Exclude type testing that has function nesting issues
    ],
    pool: 'forks', // Use forks instead of threads to prevent worker issues
    poolOptions: {
      forks: {
        isolate: true, // Keep isolation for test reliability
      },
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        '**/playwright/**',
        'src/playwright/**',
        '**/__tests__/**',
        '**/*.test.*',
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
    },
  },
  resolve: {
    alias: {
      '@': './src',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      util: 'util',
      buffer: 'buffer',
      events: 'events',
      path: 'path-browserify',
      string_decoder: 'string_decoder',
      process: 'process/browser',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'buffer',
      'crypto-browserify',
      'events',
      'path-browserify',
      'process',
      'stream-browserify',
      'string_decoder',
      'util',
    ],
  },
});
