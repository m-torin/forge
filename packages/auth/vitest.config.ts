// Prefer pulling Vitest config builders from the built QA package.
// Using a relative path avoids module resolution issues when @repo/qa exports
// are not fully emitted for vitest/configs.
// NOTE: This lives outside src/, so it won't affect contamination checks.
import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  setupFiles: ['./__tests__/setup.ts'],
  overrides: {},
});

export default defineConfig({
  ...baseConfig,
  resolve: {
    alias: {
      '@repo/db-prisma': path.resolve(__dirname, '__tests__/mocks/db-prisma.ts'),
      'better-auth/plugins/api-key': path.resolve(
        __dirname,
        '__tests__/mocks/better-auth-plugin-api-key.ts',
      ),
    },
  },
  plugins: [
    ...(baseConfig.plugins || []),
    // Ensure we load paths from this package's tsconfig.json
    tsconfigPaths({ projects: ['tsconfig.json'] }),
  ],
});
