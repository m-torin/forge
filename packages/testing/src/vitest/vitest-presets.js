import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

// Get the directory where this file is located
const filename = fileURLToPath(import.meta.url);
const currentDir = dirname(filename);

// Base test configuration shared by all presets
/** @type {import('vitest/config').UserConfig['test']} */
const baseTestConfig = {
  clearMocks: true,
  coverage: {
    provider: 'v8',
    exclude: [
      'node_modules/',
      '**/*.config.*',
      '**/*.d.ts',
      '__tests__/**',
      '**/*.stories.tsx',
      '**/test-utils.tsx',
    ],
    reporter: ['text', 'json', 'html'],
  },
  globals: true,
  mockReset: true,
  restoreMocks: true,
};

// React component testing preset - Complete UserConfig
/** @type {import('vitest/config').UserConfig} */
export const reactPreset = {
  plugins: [react()],
  test: {
    ...baseTestConfig,
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    environment: 'jsdom',
    setupFiles: [resolve(currentDir, './setup/common')],
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
};

// Node.js testing preset - Complete UserConfig
/** @type {import('vitest/config').UserConfig} */
export const nodePreset = {
  test: {
    ...baseTestConfig,
    environment: 'node',
    setupFiles: [resolve(currentDir, './setup/node')],
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
};

// Next.js testing preset - Complete UserConfig with Node.js module handling
/** @type {import('vitest/config').UserConfig} */
export const nextPreset = {
  plugins: [react()],
  test: {
    ...baseTestConfig,
    environment: 'jsdom',
    setupFiles: [resolve(currentDir, './setup/nextjs')],
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './'),
    },
  },
  define: {
    // Handle Node.js built-in modules in browser environment
    'process.env.NODE_ENV': '"test"',
    'process.env.NEXT_RUNTIME': '"nodejs"',
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      // Include polyfills for Node.js modules
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
};

// Database testing preset - Complete UserConfig
/** @type {import('vitest/config').UserConfig} */
export const databasePreset = {
  test: {
    ...baseTestConfig,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: [resolve(currentDir, './setup/database')],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Database tests should run sequentially
      },
    },
  },
};

// Integration testing preset - Complete UserConfig
/** @type {import('vitest/config').UserConfig} */
export const integrationPreset = {
  test: {
    ...baseTestConfig,
    environment: 'node',
    hookTimeout: 30000,
    setupFiles: [resolve(currentDir, './setup/integration')],
    testTimeout: 30000,
  },
};

// Helper to create custom preset with full UserConfig
/**
 * @param {import('vitest/config').UserConfig} overrides
 * @returns {import('vitest/config').UserConfig}
 */
export function createPreset(overrides = {}) {
  const { test: testOverrides, ...otherOverrides } = overrides;
  return {
    test: {
      ...baseTestConfig,
      ...testOverrides,
    },
    ...otherOverrides,
  };
}

// Default export is the React preset (most common use case)
export default reactPreset;
