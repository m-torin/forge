import { UserConfig } from "vitest/config";
import path from "path";

/**
 * Creates a base Vitest configuration for packages in the monorepo
 * @param customConfig - Custom configuration options
 * @param packageDir - The package directory (defaults to current working directory)
 * @returns Extended configuration for package testing
 */
export function createBaseConfig(
  customConfig: Partial<UserConfig> = {},
  packageDir: string = process.cwd(),
): UserConfig {
  return {
    test: {
      environment: "node",
      globals: true,
      setupFiles: [
        ...(customConfig.test?.setupFiles || []),
        // Don't rely on a missing setup file
        // path.resolve(__dirname, '../setup/index.ts'),
      ],
      include: ["**/*.test.{ts,tsx}"],

      // Enhanced coverage configuration with higher thresholds
      coverage: {
        provider: "v8",
        enabled: true,
        exclude: [
          "coverage/**",
          "dist/**",
          "**/node_modules/**",
          "**/*.d.ts",
          "test?(s)/**",
          "**/__tests__/**",
          "**/*.test.{ts,tsx}",
          "**/vitest.config.*",
        ],
        thresholds: {
          statements: 95,
          branches: 95,
          functions: 95,
          lines: 95,
        },
        ...(customConfig.test?.coverage || {}),
      },

      // Test timeout settings
      testTimeout: 10000,
      hookTimeout: 10000,

      // Sequence options for test ordering
      sequence: {
        shuffle: false,
        hooks: "stack",
        setupFiles: "parallel",
      },

      // Pool options for parallel testing
      pool: "threads",
      poolOptions: {
        threads: {
          singleThread: false,
          isolate: true,
        },
      },

      // Snapshot options
      snapshotFormat: {
        printBasicPrototype: false,
        escapeString: true,
        printFunctionName: true,
      },

      // Retry options for flaky tests
      retry: 0,

      ...(customConfig.test || {}),
    },
    resolve: {
      alias: {
        "@": path.resolve(packageDir),
        ...(customConfig.resolve?.alias || {}),
      },
    },
    ...customConfig,
  };
}

/**
 * Common configuration for Vitest
 */

// Define test configuration type
export interface TestConfig {
  environment: string;
  globals: boolean;
  setupFiles: string[];
  include: string[];
  exclude: string[];
  testTimeout: number;
  hookTimeout: number;
  deps: {
    interopDefault: boolean;
    inline: RegExp[];
    optimizer?: {
      web?: {
        include?: RegExp[];
      };
    };
  };
  coverage: {
    provider: "v8";
    enabled?: boolean;
    exclude: string[];
    thresholds: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
  };
}

// Common test configuration
export const commonTestConfig: TestConfig = {
  // Base configuration
  environment: "node",
  globals: true,
  setupFiles: ["./__tests__/setup.ts"],
  include: ["**/*.test.{ts,tsx}"],
  exclude: ["**/node_modules/**"],
  testTimeout: 10000,
  hookTimeout: 10000,

  // Skip esbuild transformation for tests
  deps: {
    interopDefault: true,
    inline: [/@repo\/.*/],
  },

  // Coverage configuration
  coverage: {
    provider: "v8",
    enabled: true,
    exclude: [
      "coverage/**",
      "dist/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "test/**",
      "tests/**",
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/vitest.config.*",
    ],
    thresholds: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};

// React testing configuration that extends the common config
export const reactTestConfig: TestConfig = {
  ...commonTestConfig,
  environment: "jsdom",
  deps: {
    ...commonTestConfig.deps,
    // Special handling for React packages
    optimizer: {
      web: {
        include: [/node_modules/],
      },
    },
  },
};

// Node testing configuration - same as common but explicitly set
export const nodeTestConfig: TestConfig = {
  ...commonTestConfig,
  environment: "node",
};
