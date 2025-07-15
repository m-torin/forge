import { createNodePackageConfig } from '@repo/qa/vitest/configs';

export default createNodePackageConfig({
  setupFiles: ['./__tests__/setup.ts'],
  overrides: {
    test: {
      environmentMatchGlobs: [
        ['**/*.test.tsx', 'jsdom'],
        ['**/hooks/**/*.test.ts', 'jsdom'],
        ['**/client/**/*.test.ts', 'jsdom'],
      ],
      coverage: {
        enabled: false,
      },
    },
  },
});
