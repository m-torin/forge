import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import { databasePreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...databasePreset,
  test: {
    name: 'database',
    globals: true,
    hookTimeout: 30000,
    root: __dirname,
    testTimeout: 30000,

    env: {
      // Mock database URLs for testing
      DATABASE_PROVIDER: 'prisma',
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
    // Environment setup
    environment: 'node',

    // Test file patterns
    include: [
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/generated/**',
      '**/migrations/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],

    // Setup files
    setupFiles: [resolve(__dirname, '__tests__/setup.ts')],

    // Reporters
    reporters: ['verbose'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      exclude: [
        'node_modules/**',
        '__tests__/**',
        '**/*.{test,spec}.*',
        '**/*.d.ts',
        'generated/**',
        'prisma/migrations/**',
        'coverage/**',
      ],
      include: [
        'firestore/**/*.ts',
        'upstash/**/*.ts',
        'redis/**/*.ts',
        'prisma/**/*.ts',
        'types.ts',
        'keys.ts',
      ],
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

    // Pool options
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Database tests should run sequentially
      },
    },

    // Retry configuration
    retry: 2,

    // Concurrent settings
    sequence: {
      concurrent: false,
    },

    // Mock options
    deps: {
      external: ['@upstash/vector', '@upstash/redis', 'firebase-admin', '@prisma/client'],
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@repo/testing': resolve(__dirname, '../testing'),
    },
  },

  // Define global constants
  define: {
    __TEST_ENV__: '"test"',
  },
});
