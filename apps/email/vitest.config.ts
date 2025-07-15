import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default createReactPackageConfig({
  setupFiles: ['./vitest.setup.ts'],
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
    test: {
      include: [
        'src/**/*.{test,spec}.{ts,tsx}',
        '__tests__/**/*.{test,spec}.{ts,tsx}',
        '*.test.{ts,tsx}',
      ],
      exclude: [
        'node_modules',
        'dist',
        'build',
        '**/.react-email/**', // Exclude react-email tests that have esbuild issues
        '__tests__/e2e/**', // Exclude e2e tests (Playwright)
      ],
    },
  },
});
