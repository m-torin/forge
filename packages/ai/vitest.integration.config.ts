import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [], // No setup files to avoid import issues
    include: ['__tests__/integration/**/*.test.ts', '__tests__/**/*-upgraded.test.ts'],
    testTimeout: 45000, // Longer timeout for integration tests
    pool: 'forks', // Better isolation for integration tests
  },
  esbuild: {
    target: 'node18',
  },
});
