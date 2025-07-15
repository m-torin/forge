import { createNodePackageConfig } from '@repo/qa/vitest/configs';
import { resolve } from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createNodePackageConfig({
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
    },
    resolve: {
      alias: {
        'server-only': resolve(process.cwd(), './mocks/server-only.ts'),
      },
    },
  },
});

export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
