import { resolve } from 'node:path';
import type { UserConfig } from 'vitest/config';
import { baseConfig, environmentConfigs, getBaseTestConfig } from './base-config';
import {
  commonCssConfig,
  commonEsbuildConfig,
  createBrowserDefines,
  getVitePlugins,
} from './vite-utils';

// Get the directory where this file is located (Node 22+ feature)
const currentDir = import.meta.dirname;
const setupDir = resolve(currentDir, '../setup');

// Helper to create a config without vitest dependency during load
function createConfigObject(
  baseConfig: UserConfig,
  config: UserConfig,
  overrides: UserConfig = {},
): UserConfig {
  // Manual deep merge implementation to avoid vitest dependency
  const merged = {
    ...baseConfig,
    ...config,
    ...overrides,
  };

  // Merge test config specifically
  // eslint-disable-next-line vitest/no-conditional-tests
  if (baseConfig.test || config.test || overrides.test) {
    merged.test = {
      ...baseConfig.test,
      ...config.test,
      ...overrides.test,
    };
  }

  // Merge coverage config
  // eslint-disable-next-line vitest/no-conditional-tests
  if (merged.test?.coverage) {
    const baseCoverage = baseConfig.test?.coverage || {};
    const configCoverage = config.test?.coverage || {};
    const overrideCoverage = overrides.test?.coverage || {};

    merged.test.coverage = {
      ...baseCoverage,
      ...configCoverage,
      ...overrideCoverage,
      exclude: [
        ...(baseCoverage.exclude || []),
        ...(configCoverage.exclude || []),
        ...(overrideCoverage.exclude || []),
      ],
    };
  }

  // Merge resolve config
  if (baseConfig.resolve || config.resolve || overrides.resolve) {
    merged.resolve = {
      ...baseConfig.resolve,
      ...config.resolve,
      ...overrides.resolve,
    };

    if (baseConfig.resolve?.alias || config.resolve?.alias || overrides.resolve?.alias) {
      merged.resolve.alias = {
        ...baseConfig.resolve?.alias,
        ...config.resolve?.alias,
        ...overrides.resolve?.alias,
      };
    }
  }

  // Merge plugins
  if (baseConfig.plugins || config.plugins || overrides.plugins) {
    merged.plugins = [
      ...(baseConfig.plugins || []),
      ...(config.plugins || []),
      ...(overrides.plugins || []),
    ];
  }

  return merged;
}

interface BuilderOptions {
  /**
   * Additional setup files to load after the standard ones
   */
  setupFiles?: string[];
  /**
   * Additional paths to exclude from tests
   */
  excludePaths?: string[];
  /**
   * Additional coverage exclusions
   */
  coverageExclude?: string[];
  /**
   * Custom aliases to add/override
   */
  aliases?: Record<string, string>;
  /**
   * Additional vitest config to merge
   */
  overrides?: UserConfig;
  /**
   * Environment variables to define
   */
  env?: Record<string, string>;
}

/**
 * Creates a standardized vitest configuration for Next.js applications
 */
export function createNextAppConfig(options: BuilderOptions = {}): UserConfig {
  const {
    setupFiles = [],
    excludePaths = [],
    coverageExclude = [],
    aliases = {},
    overrides = {},
    env = {},
  } = options;

  const config: UserConfig = {
    plugins: getVitePlugins({ react: true }),
    test: {
      server: {
        deps: {
          inline: ['@repo/qa'],
          fallbackCJS: true,
        },
      },
      ...getBaseTestConfig({
        ...environmentConfigs.jsdom,
        setupFiles: [resolve(setupDir, 'next-app.mjs'), ...setupFiles],
        exclude: [...excludePaths],
        coverage: {
          exclude: [
            'src/app/layout.tsx',
            'src/app/**/layout.tsx',
            'src/app/**/page.tsx',
            'src/app/**/loading.tsx',
            'src/app/**/error.tsx',
            'src/app/**/not-found.tsx',
            'src/app/global-error.tsx',
            'src/app/manifest.ts',
            'src/app/robots.ts',
            'src/app/sitemap.ts',
            ...coverageExclude,
          ],
          include: ['src/**/*.{ts,tsx}'],
        },
      }),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(process.cwd(), './src'),
        '@/app': resolve(process.cwd(), './src/app'),
        '@/components': resolve(process.cwd(), './src/components'),
        '@/lib': resolve(process.cwd(), './src/lib'),
        '@/hooks': resolve(process.cwd(), './src/hooks'),
        '@/utils': resolve(process.cwd(), './src/utils'),
        '@/styles': resolve(process.cwd(), './src/styles'),
        '@/types': resolve(process.cwd(), './src/types'),
        // Add workspace package resolution for @repo/* imports
        '@repo/qa': resolve(currentDir, '../..'),
        ...aliases,
      },
    },
    define: createBrowserDefines({
      'process.env.NEXT_RUNTIME': 'nodejs',
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [`process.env.${key}`, value]),
      ),
    }),
    css: commonCssConfig,
    esbuild: commonEsbuildConfig,
  };

  return createConfigObject(baseConfig, config, overrides);
}

/**
 * Creates a standardized vitest configuration for React packages/libraries
 */
export function createReactPackageConfig(options: BuilderOptions = {}): UserConfig {
  const {
    setupFiles = [],
    excludePaths = [],
    coverageExclude = [],
    aliases = {},
    overrides = {},
    env = {},
  } = options;

  const config: UserConfig = {
    plugins: getVitePlugins({ react: true }),
    test: {
      server: {
        deps: {
          inline: ['@repo/qa'],
        },
      },
      environment: 'jsdom',
      setupFiles: [resolve(setupDir, 'react-package.mjs'), ...setupFiles],
      exclude: ['node_modules', 'dist', 'build', ...excludePaths],
      coverage: {
        provider: 'v8' as const,
        ...baseConfig.test?.coverage,
        exclude: [...(baseConfig.test?.coverage?.exclude || []), ...coverageExclude],
        include: ['src/**/*.{ts,tsx}'],
        all: true,
      } as any,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(process.cwd(), './src'),
        // Add workspace package resolution for @repo/* imports
        '@repo/qa': resolve(currentDir, '../..'),
        ...aliases,
      },
    },
    define: createBrowserDefines(
      Object.fromEntries(Object.entries(env).map(([key, value]) => [`process.env.${key}`, value])),
    ),
    css: commonCssConfig,
    esbuild: commonEsbuildConfig,
  };

  return createConfigObject(baseConfig, config, overrides);
}

/**
 * Creates a standardized vitest configuration for Node.js packages
 */
export function createNodePackageConfig(options: BuilderOptions = {}): UserConfig {
  const {
    setupFiles = [],
    excludePaths = [],
    coverageExclude = [],
    aliases = {},
    overrides = {},
    env = {},
  } = options;

  const config: UserConfig = {
    test: {
      server: {
        deps: {
          inline: ['@repo/qa'],
        },
      },
      environment: 'node',
      setupFiles: [resolve(setupDir, 'node-package.mjs'), ...setupFiles],
      exclude: ['node_modules', 'dist', 'build', ...excludePaths],
      coverage: {
        provider: 'v8' as const,
        ...baseConfig.test?.coverage,
        exclude: [...(baseConfig.test?.coverage?.exclude || []), ...coverageExclude],
        include: ['src/**/*.{ts,js}'],
        all: true,
      } as any,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(process.cwd(), './src'),
        // Add workspace package resolution for @repo/* imports
        '@repo/qa': resolve(currentDir, '../..'),
        ...aliases,
      },
    },
    define: {
      'process.env.NODE_ENV': '"test"',
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
    },
  };

  return createConfigObject(baseConfig, config, overrides);
}

/**
 * Creates a standardized vitest configuration for packages with database tests
 */
export function createDatabasePackageConfig(options: BuilderOptions = {}): UserConfig {
  const {
    setupFiles = [],
    excludePaths = [],
    coverageExclude = [],
    aliases = {},
    overrides = {},
    env = {},
  } = options;

  const config: UserConfig = {
    test: {
      server: {
        deps: {
          inline: ['@repo/qa'],
        },
      },
      environment: 'node',
      testTimeout: 30000,
      hookTimeout: 30000,
      setupFiles: [resolve(setupDir, 'database.mjs'), ...setupFiles],
      exclude: ['node_modules', 'dist', 'build', ...excludePaths],
      coverage: {
        provider: 'v8' as const,
        ...baseConfig.test?.coverage,
        exclude: [...(baseConfig.test?.coverage?.exclude || []), ...coverageExclude],
        include: ['src/**/*.{ts,js}'],
        all: true,
      } as any,
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true, // Database tests should run sequentially
        },
      },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(process.cwd(), './src'),
        // Add workspace package resolution for @repo/* imports
        '@repo/qa': resolve(currentDir, '../..'),
        ...aliases,
      },
    },
    define: {
      'process.env.NODE_ENV': '"test"',
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
    },
  };

  return createConfigObject(baseConfig, config, overrides);
}

/**
 * Creates a standardized vitest configuration for QStash/queue-based packages
 */
export function createQStashPackageConfig(options: BuilderOptions = {}): UserConfig {
  const {
    setupFiles = [],
    excludePaths = [],
    coverageExclude = [],
    aliases = {},
    overrides = {},
    env = {},
  } = options;

  const config: UserConfig = {
    test: {
      server: {
        deps: {
          inline: ['@repo/qa'],
        },
      },
      environment: 'node',
      testTimeout: 30000,
      hookTimeout: 30000,
      setupFiles: [resolve(setupDir, 'qstash.mjs'), ...setupFiles],
      exclude: ['node_modules', 'dist', 'build', ...excludePaths],
      coverage: {
        provider: 'v8' as const,
        ...baseConfig.test?.coverage,
        exclude: [...(baseConfig.test?.coverage?.exclude || []), ...coverageExclude],
        include: ['src/**/*.{ts,js}'],
        all: true,
      } as any,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(process.cwd(), './src'),
        // Add workspace package resolution for @repo/* imports
        '@repo/qa': resolve(currentDir, '../..'),
        ...aliases,
      },
    },
    define: {
      'process.env.NODE_ENV': '"test"',
      'process.env.QSTASH_URL': '"http://localhost:8081"',
      'process.env.QSTASH_TOKEN':
        '"eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0="',
      'process.env.QSTASH_CURRENT_SIGNING_KEY': '"sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r"',
      'process.env.QSTASH_NEXT_SIGNING_KEY': '"sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs"',
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
    },
  };

  return createConfigObject(baseConfig, config, overrides);
}

/**
 * Creates a custom vitest configuration by merging with base config
 */
export function createCustomConfig(config: UserConfig): UserConfig {
  return createConfigObject(baseConfig, config);
}

// Export all builder functions
export default {
  createNextAppConfig,
  createReactPackageConfig,
  createNodePackageConfig,
  createDatabasePackageConfig,
  createQStashPackageConfig,
  createCustomConfig,
};
