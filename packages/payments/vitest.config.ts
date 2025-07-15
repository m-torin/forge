import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      environmentMatchGlobs: [
        ['**/*client-next.test.tsx', 'jsdom'],
        ['**/*env.test.ts', 'node'],
        ['**/*.test.{ts,tsx}', 'node'],
      ],
      coverage: {
        thresholds: {
          lines: 70,
          functions: 70,
          branches: 80,
          statements: 70,
        },
      },
    },
  },
});
