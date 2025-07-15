import type { UserConfig } from 'vitest/config';
import { baseTestConfig } from './base-config';

/**
 * Optimized coverage configuration for pnpm 10 and Turborepo
 *
 * Features:
 * - Optimized for parallel execution with Turborepo
 * - Uses JSON reporter for better aggregation
 * - Minimal overhead configuration
 * - Smart caching boundaries
 */
export const optimizedCoverageConfig: any = {
  enabled: true,
  provider: 'v8',
  reporter: process.env.VITEST_COVERAGE_REPORTER
    ? [process.env.VITEST_COVERAGE_REPORTER as any]
    : ['json', 'json-summary'],
  reportsDirectory: './coverage',
  all: true,
  clean: true,
  skipFull: false,
  perFile: false,
  exclude: [
    ...((baseTestConfig?.coverage as any)?.exclude || []),
    // Additional exclusions for faster coverage
    '**/index.ts',
    '**/index.tsx',
    '**/constants.ts',
    '**/types.ts',
    '**/*.types.ts',
    '**/env.ts',
  ],
  // V8 specific optimizations
  reportOnFailure: true,
  processingConcurrency: 5,
};

/**
 * Create optimized coverage configuration
 */
export function createOptimizedCoverageConfig(overrides: any = {}): any {
  return {
    ...optimizedCoverageConfig,
    ...overrides,
    exclude: [...(optimizedCoverageConfig.exclude || []), ...(overrides.exclude || [])],
  } as any;
}

/**
 * Optimized test configuration for coverage runs
 */
export const optimizedTestConfig: Partial<UserConfig['test']> = {
  // Performance optimizations
  isolate: false, // Faster execution in same context

  // Reporter configuration
  reporters: process.env.VITEST_COVERAGE_REPORTER === 'json' ? ['json'] : ['default'],
  outputFile: {
    json: './coverage/test-results.json',
  },

  // Timeout configurations for CI
  testTimeout: parseInt(process.env.VITEST_TEST_TIMEOUT || '30000'),
  hookTimeout: parseInt(process.env.VITEST_HOOK_TIMEOUT || '30000'),

  // Watch mode disabled for coverage runs
  watch: false,

  // Bail on first failure in CI
  bail: process.env.CI ? 1 : 0,

  // Pool configuration for optimal performance
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,
      useAtomics: true,
      minThreads: 1,
      maxThreads: process.env.CI ? 4 : undefined,
    },
  },

  // Cache configuration
  cache: {
    dir: '../../../node_modules/.vitest',
  },

  // Environment
  environment: 'node',
};

/**
 * Create a Vitest configuration optimized for coverage collection
 */
export function createCoverageOptimizedConfig(
  options: {
    environment?: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime';
    setupFiles?: string[];
    overrides?: Partial<UserConfig['test']>;
    coverageOverrides?: any;
  } = {},
): UserConfig {
  const { environment = 'node', setupFiles = [], overrides = {}, coverageOverrides = {} } = options;

  return {
    test: {
      ...optimizedTestConfig,
      ...overrides,
      environment,
      setupFiles,
      coverage: createOptimizedCoverageConfig(coverageOverrides),
    },
  };
}

/**
 * Builder functions for different package types
 */
export const coverageOptimizedBuilders = {
  // For Node.js packages
  node: (options: Parameters<typeof createCoverageOptimizedConfig>[0] = {}) =>
    createCoverageOptimizedConfig({
      ...options,
      environment: 'node',
    }),

  // For React packages
  react: (options: Parameters<typeof createCoverageOptimizedConfig>[0] = {}) =>
    createCoverageOptimizedConfig({
      ...options,
      environment: 'jsdom',
      overrides: {
        ...options.overrides,
        css: {
          modules: {
            classNameStrategy: 'non-scoped' as const,
          },
        },
      },
    }),

  // For Next.js apps
  nextjs: (options: Parameters<typeof createCoverageOptimizedConfig>[0] = {}) =>
    createCoverageOptimizedConfig({
      ...options,
      environment: 'jsdom',
      overrides: {
        ...options.overrides,
        alias: {
          '@': process.cwd(),
          '~': process.cwd(),
          '#': process.cwd(),
        },
      },
    }),
};

export default createCoverageOptimizedConfig;
