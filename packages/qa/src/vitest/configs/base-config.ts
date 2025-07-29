import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserConfig } from 'vitest/config';

/**
 * Base test configuration shared across all Vitest configurations
 * This is the single source of truth for common test settings
 */
export const baseTestConfig: UserConfig['test'] = {
  // Mock behavior
  clearMocks: true,
  mockReset: true,
  restoreMocks: true,

  // Global setup
  globals: true,

  // Coverage configuration
  coverage: {
    enabled: false,
    provider: 'v8',
    reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
    exclude: [
      // Dependencies
      'node_modules/**',

      // Build outputs
      'dist/**',
      'build/**',
      '.next/**',

      // Test files
      '__tests__/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/test-utils.*',
      '**/setup.*',
      '**/mocks/**',
      'e2e-tests/**',
      'playwright-report/**',
      'test-results/**',

      // Config files
      '**/*.config.*',

      // Type definitions
      '**/*.d.ts',

      // Storybook
      '**/*.stories.*',

      // Generated files
      'generated/**',
      '**/generated/**',
    ],
    all: true,
    thresholds: {
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
  },

  // Default excludes for test discovery
  exclude: [
    'node_modules',
    'dist',
    'build',
    '.next',
    'e2e-tests/**/*',
    'playwright-report/**/*',
    'test-results/**/*',
  ],
};

/**
 * Base Vitest configuration
 * Can be used as a starting point for all configurations
 */
export const baseConfig: UserConfig = {
  test: {
    ...baseTestConfig,
    server: {
      deps: {
        inline: [/@repo\/testing/, 'react', 'react-dom'],
        external: [],
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
    alias: {
      '@repo/qa': resolve(dirname(fileURLToPath(import.meta.url)), '../../..'),
      '@logtape/cloudwatch-logs': resolve(
        dirname(fileURLToPath(import.meta.url)),
        '../mocks/providers/logtape-cloudwatch-stub.ts',
      ),
    },
  },
  optimizeDeps: {
    include: ['@repo/qa'],
    force: true,
  },
};

/**
 * Get base test config with optional overrides
 */
export function getBaseTestConfig(overrides: Partial<UserConfig['test']> = {}): UserConfig['test'] {
  return {
    ...baseTestConfig,
    ...overrides,
    coverage: {
      ...baseTestConfig?.coverage,
      ...(overrides.coverage || {}),
      exclude: [
        ...(baseTestConfig?.coverage?.exclude || []),
        ...((overrides.coverage?.exclude || []) as string[]),
      ],
    },
    exclude: [...(baseTestConfig?.exclude || []), ...(overrides.exclude || [])],
  };
}

/**
 * Environment-specific base configurations
 */
export const environmentConfigs = {
  jsdom: {
    environment: 'jsdom' as const,
    css: {
      modules: {
        classNameStrategy: 'non-scoped' as const,
      },
    },
  },

  node: {
    environment: 'node' as const,
  },

  edge: {
    environment: 'edge-runtime' as const,
  },
} as const;

/**
 * Options for creating base configuration
 */
export interface BaseConfigOptions {
  aliases?: Record<string, string>;
  coverage?: boolean;
  environment?: 'jsdom' | 'node' | 'happy-dom' | 'edge-runtime';
  rootDir?: string;
  setupFiles?: string[];
}

/**
 * Creates a base Vitest configuration with common settings
 * This function is used by legacy configurations for backward compatibility
 */
export function createBaseConfig(options: BaseConfigOptions = {}): UserConfig {
  const {
    aliases = {},
    coverage = false,
    environment = 'jsdom',
    rootDir = process.cwd(),
    setupFiles = [],
  } = options;

  // Get current directory for proper path resolution
  const currentDir = import.meta.dirname;
  const packagesDir = resolve(currentDir, '../../../packages');

  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(rootDir, './'),
        '@repo': packagesDir,
        ...aliases,
      },
    },
    test: {
      ...baseTestConfig,
      environment: environment as any,
      setupFiles,
      coverage: coverage
        ? {
            ...baseTestConfig?.coverage,
            enabled: true,
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
          }
        : {
            ...baseTestConfig?.coverage,
            enabled: false,
          },
    },
  };
}

/**
 * Default base configuration export
 */
export default createBaseConfig();

/**
 * Timeout configurations for different test types
 */
export const timeoutConfigs = {
  standard: {
    testTimeout: 5000,
    hookTimeout: 5000,
  },

  extended: {
    testTimeout: 30000,
    hookTimeout: 30000,
  },

  integration: {
    testTimeout: 60000,
    hookTimeout: 60000,
  },
} as const;

/**
 * Pool configurations for different test scenarios
 */
export const poolConfigs = {
  // Run tests in parallel (default)
  parallel: {},

  // Run tests sequentially (good for database tests)
  sequential: {
    pool: 'forks' as const,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
} as const;
