import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserConfig } from 'vitest/config';
import { baseTestConfig, environmentConfigs, getBaseTestConfig } from './base-config';
import {
  commonCssConfig,
  commonEsbuildConfig,
  createBrowserDefines,
  getVitePlugins,
} from './vite-utils';

// Get the directory where this file is located
const filename = fileURLToPath(import.meta.url);
const currentDir = dirname(filename);
const setupDir = resolve(currentDir, '../setup');

// React component testing preset
export const reactPreset: UserConfig = {
  plugins: getVitePlugins({ react: true }) as any,
  test: getBaseTestConfig({
    ...environmentConfigs.jsdom,
    setupFiles: [resolve(setupDir, 'common.ts')],
  }),
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
  css: commonCssConfig,
  esbuild: commonEsbuildConfig,
  define: createBrowserDefines(),
};

// Node.js testing preset
export const nodePreset: UserConfig = {
  test: {
    ...baseTestConfig,
    environment: 'node',
    setupFiles: [resolve(setupDir, 'common.ts')],
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
};

// Next.js testing preset
export const nextPreset: UserConfig = {
  plugins: getVitePlugins({ react: true }) as any,
  test: {
    ...baseTestConfig,
    environment: 'jsdom',
    setupFiles: [resolve(setupDir, 'nextjs.ts')],
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './'),
    },
  },
  css: commonCssConfig,
  esbuild: commonEsbuildConfig,
  define: createBrowserDefines({
    'process.env.NEXT_RUNTIME': 'nodejs',
  }),
};

// Database testing preset
export const databasePreset: UserConfig = {
  test: {
    ...baseTestConfig,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: [resolve(setupDir, 'database.ts')],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Database tests should run sequentially
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
};

// QStash testing preset
export const qstashPreset: UserConfig = {
  test: {
    ...baseTestConfig,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: [resolve(setupDir, 'qstash.ts')],
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    // QStash environment variables
    'process.env.QSTASH_URL': '"http://localhost:8081"',
    'process.env.QSTASH_TOKEN':
      '"eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0="',
    'process.env.QSTASH_CURRENT_SIGNING_KEY': '"sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r"',
    'process.env.QSTASH_NEXT_SIGNING_KEY': '"sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs"',
  },
};

// Integration testing preset
export const integrationPreset: UserConfig = {
  test: {
    ...baseTestConfig,
    environment: 'node',
    hookTimeout: 30000,
    setupFiles: [resolve(setupDir, 'integration.ts')],
    testTimeout: 30000,
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
};

// Helper to create custom preset
export function createPreset(overrides: UserConfig = {}): UserConfig {
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
