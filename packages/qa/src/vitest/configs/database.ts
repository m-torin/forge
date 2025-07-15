import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

// Database-specific Vitest configuration
export const createDatabaseTestConfig = (
  options: {
    provider?: 'prisma' | 'firestore' | 'upstash-vector' | 'upstash-redis' | 'all';
    testDir?: string;
    timeout?: number;
  } = {},
) => {
  const {
    provider = 'all',
    testDir = '__tests__',
    timeout = 30000, // 30 seconds for database operations
  } = options;

  return defineConfig({
    test: {
      name: `database-${provider}`,
      hookTimeout: timeout,
      root: process.cwd(),
      teardownTimeout: timeout,
      testTimeout: timeout,

      // Environment setup
      env: {
        // Mock database URLs for testing
        DATABASE_PROVIDER: provider === 'all' ? 'prisma' : provider,
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        FIREBASE_CLIENT_EMAIL: 'mock@example.com',
        FIREBASE_PRIVATE_KEY: 'mock-private-key',
        FIREBASE_PROJECT_ID: 'mock-project',
        NODE_ENV: 'test',
        UPSTASH_REDIS_REST_TOKEN: 'mock-redis-token',
        UPSTASH_REDIS_REST_URL: 'https://mock-redis.upstash.io',
        UPSTASH_VECTOR_REST_TOKEN: 'mock-vector-token',
        UPSTASH_VECTOR_REST_URL: 'https://mock-vector.upstash.io',
      },

      // Test file patterns
      include: [
        `${testDir}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`,
        `${testDir}/**/*.database.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`,
      ],

      // Exclude patterns
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      ],

      // Setup files
      setupFiles: [resolve(import.meta.dirname, '../setup/database.ts')],

      // Global setup/teardown
      globalSetup:
        provider !== 'all'
          ? [resolve(import.meta.dirname, `../setup/global-${provider}.ts`)]
          : [resolve(import.meta.dirname, '../setup/global-database.ts')],

      // Reporters
      reporters: ['verbose'],

      // Coverage configuration
      coverage: {
        provider: 'v8',
        exclude: [
          'node_modules/**',
          'dist/**',
          '__tests__/**',
          '**/*.{test,spec}.*',
          '**/*.d.ts',
          'coverage/**',
        ],
        include: ['src/**/*.{js,ts}', 'lib/**/*.{js,ts}', '**/*.{js,ts}'],
        reporter: ['text', 'json', 'html'],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      },

      // Pool options for database tests
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true, // Ensure tests run in sequence for database operations
        },
      },

      // Retry configuration
      retry: 2,

      // Concurrent settings
      sequence: {
        concurrent: false, // Database tests should run sequentially
      },

      // Mock options
      deps: {
        external: ['@upstash/vector', '@upstash/redis', 'firebase-admin'],
      },
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
        '@repo/database': resolve(process.cwd(), '../database'),
        '@repo/qa': resolve(import.meta.dirname, '..'),
      },
    },

    // Define global constants
    define: {
      __DATABASE_PROVIDER__: `"${provider}"`,
      __TEST_ENV__: '"test"',
    },
  });
};

// Provider-specific configurations
export const prismaTestConfig = () =>
  createDatabaseTestConfig({
    provider: 'prisma',
    testDir: '__tests__/prisma',
  });

export const firestoreTestConfig = () =>
  createDatabaseTestConfig({
    provider: 'firestore',
    testDir: '__tests__/firestore',
  });

export const vectorTestConfig = () =>
  createDatabaseTestConfig({
    provider: 'upstash-vector',
    testDir: '__tests__/vector',
  });

export const redisTestConfig = () =>
  createDatabaseTestConfig({
    provider: 'upstash-redis',
    testDir: '__tests__/redis',
  });

// Integration test configuration for all providers
export const integrationTestConfig = () =>
  createDatabaseTestConfig({
    provider: 'all',
    testDir: '__tests__/integration',
    timeout: 60000, // Longer timeout for integration tests
  });

// Default export
export default createDatabaseTestConfig();
