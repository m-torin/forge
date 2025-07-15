import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  overrides: {
    test: {
      testTimeout: 30000,
      hookTimeout: 30000,
      include: ['**/*.{test,spec}.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
      coverage: {
        exclude: [
          'node_modules/**',
          'dist/**',
          'coverage/**',
          '**/*.d.ts',
          '**/__tests__/**',
          '**/*.test.*',
          '**/*.config.*',
          '**/vitest.*.ts',
        ],
        include: ['src/**/*.{ts,js}'],
      },
    },
    define: {
      'process.env.NODE_ENV': '"test"',
      'process.env.VITEST': '"true"',
      'process.env.QSTASH_URL': '"http://localhost:8081"',
      'process.env.QSTASH_TOKEN':
        '"eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0="',
      'process.env.QSTASH_CURRENT_SIGNING_KEY': '"sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r"',
      'process.env.QSTASH_NEXT_SIGNING_KEY': '"sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs"',
      'process.env.UPSTASH_REDIS_REST_URL': '"https://test-redis.upstash.io"',
      'process.env.UPSTASH_REDIS_REST_TOKEN': '"test-redis-token"',
    },
  },
});
