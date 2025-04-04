import { UserConfig } from 'vitest/config';
import path from 'path';
import { createBaseConfig } from './base.ts';

/**
 * Creates a server-specific Vitest configuration for packages in the monorepo
 * @param customConfig - Custom configuration options
 * @param packageDir - The package directory (defaults to current working directory)
 * @returns Extended configuration for server package testing
 */
export function createServerConfig(
  customConfig: Partial<UserConfig> = {},
  packageDir: string = process.cwd(),
): UserConfig {
  // Start with the base configuration
  const baseConfig = createBaseConfig(customConfig, packageDir);

  // Extend with server-specific settings
  return {
    ...baseConfig,
    test: {
      ...baseConfig.test,
      // Override with server-specific test settings
      environment: 'node', // Always use Node environment for server packages
      globals: true,

      // Enhanced coverage configuration with higher thresholds for server code
      coverage: {
        ...(baseConfig.test?.coverage || {}),
        thresholds: {
          statements: 95,
          branches: 95,
          functions: 95,
          lines: 95,
        },
      },

      // Server-specific timeout settings (may need longer for API tests)
      testTimeout: 15000,
      hookTimeout: 10000,

      // Additional server-specific test settings
      typecheck: {
        enabled: true,
        tsconfig: path.resolve(packageDir, 'tsconfig.json'),
      },

      ...(customConfig.test || {}),
    },
  };
}
