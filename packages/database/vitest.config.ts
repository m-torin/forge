import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  setupFiles: ['__tests__/setup.ts'],
  env: {
    DATABASE_PROVIDER: 'prisma',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    FIREBASE_CLIENT_EMAIL: 'mock@example.com',
    FIREBASE_PRIVATE_KEY: 'mock-private-key',
    FIREBASE_PROJECT_ID: 'mock-project',
    UPSTASH_REDIS_REST_TOKEN: 'mock-redis-token',
    UPSTASH_REDIS_REST_URL: 'https://mock-redis.upstash.io',
    UPSTASH_VECTOR_REST_TOKEN: 'mock-vector-token',
    UPSTASH_VECTOR_REST_URL: 'https://mock-vector.upstash.io',
  },
  overrides: {
    test: {
      testTimeout: 30000,
      hookTimeout: 30000,
      include: [
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/generated/**',
        '**/migrations/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
      reporters: ['verbose'],
      coverage: {
        include: [
          'firestore/**/*.ts',
          'upstash/**/*.ts',
          'redis/**/*.ts',
          'prisma/**/*.ts',
          'types.ts',
          'keys.ts',
        ],
        exclude: [
          'node_modules/**',
          '__tests__/**',
          '**/*.{test,spec}.*',
          '**/*.d.ts',
          'generated/**',
          'prisma/migrations/**',
          'coverage/**',
        ],
        thresholds: {
          branches: 10,
          functions: 10,
          lines: 10,
          statements: 10,
        },
      },
      retry: 2,
      sequence: {
        concurrent: false,
      },
      deps: {
        external: ['@upstash/vector', '@upstash/redis', 'firebase-admin', '@prisma/client'],
      },
    },
    define: {
      __TEST_ENV__: '"test"',
    },
  },
});
