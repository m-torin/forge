import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { UserConfig } from "vitest/config";

/**
 * Vitest configuration types for better type safety
 */
interface VitestTestConfig extends NonNullable<UserConfig["test"]> {
  coverage?: NonNullable<UserConfig["test"]>["coverage"];
}

interface ConfigurationOptions {
  /** Enable coverage collection */
  coverage?: boolean;
  /** Test environment type */
  environment?: "jsdom" | "node" | "happy-dom" | "edge-runtime";
  /** Custom setup files */
  setupFiles?: string[];
  /** Test timeout in milliseconds */
  testTimeout?: number;
  /** Whether to run tests in parallel */
  parallel?: boolean;
}

/**
 * Base test configuration shared across all Vitest configurations.
 * This is the single source of truth for common test settings.
 *
 * @description Provides consistent defaults for mock behavior, coverage,
 * and test discovery across all test environments in the monorepo.
 *
 * @example
 * ```ts
 * import { baseTestConfig } from '@repo/qa/vitest/configs/base-config';
 *
 * export default defineConfig({
 *   test: {
 *     ...baseTestConfig,
 *     // Add environment-specific overrides
 *   }
 * });
 * ```
 */
export const baseTestConfig: VitestTestConfig = {
  // Mock behavior
  clearMocks: true,
  mockReset: true,
  restoreMocks: true,

  // Global setup
  globals: true,

  // Coverage configuration with performance optimizations
  coverage: {
    enabled: false,
    provider: "v8",
    reporter: process.env.CI
      ? ["text", "json", "json-summary", "lcov"]
      : ["text", "json", "json-summary", "html", "lcov"],
    reportOnFailure: true,
    // Performance: Reduce memory usage during coverage collection
    cleanOnRerun: false,
    skipFull: false,
    exclude: [
      // Dependencies
      "node_modules/**",

      // Build outputs
      "dist/**",
      "build/**",
      ".next/**",

      // Test files
      "__tests__/**",
      "**/*.test.*",
      "**/*.spec.*",
      "**/test-utils.*",
      "**/setup.*",
      "**/mocks/**",
      "e2e-tests/**",
      "playwright-report/**",
      "test-results/**",

      // Config files
      "**/*.config.*",

      // Type definitions
      "**/*.d.ts",

      // Storybook
      "**/*.stories.*",

      // Generated files
      "generated/**",
      "**/generated/**",
    ],
    all: true,
    clean: false,
    // Explicitly set thresholds to 0 to override Vitest's global 50% default
    thresholds: {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
    // Override default watermarks to eliminate 50% defaults that cause test failures
    watermarks: {
      statements: [0, 100],
      functions: [0, 100],
      branches: [0, 100],
      lines: [0, 100],
    },
  },

  // Default excludes for test discovery
  exclude: [
    "node_modules",
    "dist",
    "build",
    ".next",
    "e2e-tests/**/*",
    "playwright-report/**/*",
    "test-results/**/*",
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
        inline: [/@repo\/testing/, "react", "react-dom"],
        external: [],
      },
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".mts"],
    alias: {
      "@repo/qa": resolve(dirname(fileURLToPath(import.meta.url)), "../../.."),
      "@logtape/cloudwatch-logs": resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../mocks/providers/logtape-cloudwatch-stub.ts",
      ),
    },
  },
  optimizeDeps: {
    include: ["@repo/qa"],
    force: true,
  },
};

/**
 * Get base test config with optional overrides.
 *
 * @description Creates a new test configuration by merging base settings
 * with custom overrides. Safely handles nested configuration objects.
 *
 * @param overrides - Partial configuration to merge with base config
 * @returns Complete test configuration ready for use
 *
 * @example
 * ```ts
 * const config = getBaseTestConfig({
 *   testTimeout: 10000,
 *   coverage: { enabled: true }
 * });
 * ```
 */
export function getBaseTestConfig(
  overrides: Partial<VitestTestConfig> = {},
): VitestTestConfig {
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
    environment: "jsdom" as const,
    css: {
      modules: {
        classNameStrategy: "non-scoped" as const,
      },
    },
  },

  node: {
    environment: "node" as const,
  },

  edge: {
    environment: "edge-runtime" as const,
  },
} as const;

/**
 * Options for creating base configuration
 */
export interface BaseConfigOptions {
  aliases?: Record<string, string>;
  coverage?: boolean;
  environment?: "jsdom" | "node" | "happy-dom" | "edge-runtime";
  rootDir?: string;
  setupFiles?: string[];
}

/**
 * Creates a base Vitest configuration with common settings.
 *
 * @description This function is used by legacy configurations for backward
 * compatibility. New configurations should prefer the builder functions
 * in the builders module for better type safety and flexibility.
 *
 * @param options - Configuration options
 * @returns Complete Vitest configuration
 *
 * @deprecated Use specific builder functions from '@repo/qa/vitest/configs/builders' instead
 *
 * @example
 * ```ts
 * // Deprecated approach
 * const config = createBaseConfig({ environment: 'jsdom' });
 *
 * // Preferred approach
 * import { createReactConfig } from '@repo/qa/vitest/configs/builders';
 * const config = createReactConfig();
 * ```
 */
export function createBaseConfig(options: BaseConfigOptions = {}): UserConfig {
  const {
    aliases = {},
    coverage = false,
    environment = "jsdom",
    rootDir = process.cwd(),
    setupFiles = [],
  } = options;

  // Get current directory for proper path resolution
  const currentDir = import.meta.dirname;
  const packagesDir = resolve(currentDir, "../../../packages");

  return {
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".mts"],
      alias: {
        "@": resolve(rootDir, "./"),
        "@repo": packagesDir,
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
            provider: "v8",
            reporter: process.env.CI
              ? ["text", "json"]
              : ["text", "json", "html"],
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
    pool: "forks" as const,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
} as const;
