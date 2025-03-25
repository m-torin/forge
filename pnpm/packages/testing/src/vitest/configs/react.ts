import { UserConfig } from 'vitest/config';
import { createBaseConfig } from './base.ts';
import path from 'path';
import react from '@vitejs/plugin-react';

/**
 * Creates a Vitest configuration for React packages in the monorepo
 * @param customConfig - Custom configuration options
 * @param packageDir - The package directory (defaults to current working directory)
 * @returns Extended configuration for React package testing
 */
export function createReactConfig(
  customConfig: Partial<UserConfig> = {},
  packageDir: string = process.cwd(),
): UserConfig {
  return createBaseConfig(
    {
      plugins: [react(), ...(customConfig.plugins || [])],
      test: {
        environment: 'jsdom',
        globals: true,
        hookTimeout: 10000,
        testTimeout: 10000,
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          exclude: [
            'coverage/**',
            'dist/**',
            '**/node_modules/**',
            '**/*.d.ts',
            'test?(s)/**',
            '**/__tests__/**',
            '**/*.test.{ts,tsx}',
            '**/vitest.config.*',
          ],
          ...(customConfig.test?.coverage || {}),
        },
        ...(customConfig.test || {}),
      },
      ...customConfig,
    },
    packageDir,
  );
}
