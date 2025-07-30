import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserConfig } from 'vitest/config';
import { baseConfig, getBaseTestConfig } from './base-config';
import { getVitePlugins } from './vite-utils';

// Get the directory where this file is located
const filename = fileURLToPath(import.meta.url);
const currentDir = dirname(filename);
const setupDir = resolve(currentDir, '../setup');

// Type testing configuration options
export interface TypeTestingOptions {
  /**
   * Additional setup files to load
   */
  setupFiles?: string[];

  /**
   * Additional paths to exclude from tests
   */
  excludePaths?: string[];

  /**
   * Type checking mode
   */
  typeCheckMode?: 'strict' | 'loose';

  /**
   * TypeScript compiler options
   */
  compilerOptions?: Record<string, any>;

  /**
   * Additional aliases to add/override
   */
  aliases?: Record<string, string>;

  /**
   * Whether to include type-only tests
   */
  includeTypeOnlyTests?: boolean;

  /**
   * Whether to run type tests in parallel
   */
  parallel?: boolean;

  /**
   * Custom type test patterns
   */
  typeTestPatterns?: string[];

  /**
   * Additional vitest config to merge
   */
  overrides?: UserConfig;
}

/**
 * Creates a type testing configuration for TypeScript projects
 */
export function createTypeTestingConfig(options: TypeTestingOptions = {}): UserConfig {
  const {
    setupFiles = [],
    excludePaths = [],
    typeCheckMode = 'strict',
    compilerOptions = {},
    aliases = {},
    includeTypeOnlyTests = true,
    parallel = false,
    typeTestPatterns = ['**/*.type.test.ts', '**/*.types.test.ts'],
    overrides = {},
  } = options;

  const config: UserConfig = {
    plugins: getVitePlugins({ react: false }) as any,

    test: {
      ...getBaseTestConfig({
        environment: 'node',
        setupFiles: [resolve(setupDir, 'type-testing.mjs'), ...setupFiles],
        exclude: [
          // Standard exclusions
          'node_modules',
          'dist',
          'build',
          '.next',

          // Type testing specific exclusions
          '**/*.spec.ts',
          '**/*.test.ts',
          '!**/*.type.test.ts',
          '!**/*.types.test.ts',

          // Additional exclusions
          ...excludePaths,
        ],

        include: [
          // Type testing specific includes
          ...typeTestPatterns,

          // Include type-only tests if enabled
          ...(includeTypeOnlyTests ? ['**/*.type-only.test.ts'] : []),
        ],

        // Type testing specific settings
        typecheck: {
          enabled: true,
          checker: 'tsc',
          include: typeTestPatterns,
          exclude: ['node_modules', 'dist', 'build', '.next', ...excludePaths],
          tsconfig: 'tsconfig.json',
        },

        // Run type tests in series by default for better error reporting
        pool: parallel ? 'threads' : 'forks',
        poolOptions: {
          threads: {
            singleThread: !parallel,
          },
          forks: {
            singleFork: !parallel,
          },
        },

        // Type testing specific timeouts
        testTimeout: 10000,
        hookTimeout: 10000,

        // Coverage configuration for type tests
        coverage: {
          enabled: false, // Type tests don't need coverage
          provider: 'v8',
        },
      }),

      // Server configuration
      server: {
        deps: {
          inline: ['@repo/qa', 'expect-type'],
        },
      },
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(process.cwd(), './src'),
        '#/types': resolve(process.cwd(), './src/types'),
        '#/lib': resolve(process.cwd(), './src/lib'),
        '#/utils': resolve(process.cwd(), './src/utils'),
        ...aliases,
      },
    },

    define: {
      'process.env.NODE_ENV': '"test"',
      'process.env.VITEST_TYPE_TESTING': 'true',
    },

    // Esbuild configuration for type testing
    esbuild: {
      target: 'es2020',
      format: 'esm',
      sourcemap: false,
      keepNames: true,
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: true,
          ...compilerOptions,
        },
      },
    },
  };

  return {
    ...baseConfig,
    ...config,
    ...overrides,
    test: {
      ...baseConfig.test,
      ...config.test,
      ...overrides.test,
    },
  };
}

/**
 * Creates a type testing configuration for Next.js applications
 */
export function createNextJsTypeTestingConfig(options: TypeTestingOptions = {}): UserConfig {
  return createTypeTestingConfig({
    ...options,
    aliases: {
      '@': resolve(process.cwd(), './src'),
      '#/app': resolve(process.cwd(), './src/app'),
      '#/components': resolve(process.cwd(), './src/components'),
      '#/lib': resolve(process.cwd(), './src/lib'),
      '#/hooks': resolve(process.cwd(), './src/hooks'),
      '#/utils': resolve(process.cwd(), './src/utils'),
      '#/types': resolve(process.cwd(), './src/types'),
      '#/styles': resolve(process.cwd(), './src/styles'),
      ...options.aliases,
    },
    compilerOptions: {
      jsx: 'react-jsx',
      jsxImportSource: 'react',
      allowJs: true,
      resolveJsonModule: true,
      isolatedModules: true,
      incremental: true,
      plugins: [
        {
          name: 'next',
        },
      ],
      ...options.compilerOptions,
    },
  });
}

/**
 * Creates a type testing configuration for React packages
 */
export function createReactTypeTestingConfig(options: TypeTestingOptions = {}): UserConfig {
  return createTypeTestingConfig({
    ...options,
    compilerOptions: {
      jsx: 'react-jsx',
      jsxImportSource: 'react',
      allowJs: true,
      resolveJsonModule: true,
      isolatedModules: true,
      ...options.compilerOptions,
    },
  });
}

/**
 * Creates a type testing configuration for Node.js packages
 */
export function createNodeTypeTestingConfig(options: TypeTestingOptions = {}): UserConfig {
  return createTypeTestingConfig({
    ...options,
    compilerOptions: {
      module: 'ESNext',
      target: 'ES2020',
      moduleResolution: 'node',
      allowJs: true,
      resolveJsonModule: true,
      isolatedModules: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      ...options.compilerOptions,
    },
  });
}

/**
 * Creates a type testing configuration for API/schema validation
 */
export function createApiTypeTestingConfig(options: TypeTestingOptions = {}): UserConfig {
  return createTypeTestingConfig({
    ...options,
    typeTestPatterns: [
      '**/*.api.type.test.ts',
      '**/*.schema.type.test.ts',
      '**/*.model.type.test.ts',
      ...(options.typeTestPatterns || []),
    ],
    compilerOptions: {
      strictNullChecks: true,
      strictFunctionTypes: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      ...options.compilerOptions,
    },
  });
}

/**
 * Creates a type testing configuration for component libraries
 */
export function createComponentLibraryTypeTestingConfig(
  options: TypeTestingOptions = {},
): UserConfig {
  return createTypeTestingConfig({
    ...options,
    typeTestPatterns: [
      '**/*.component.type.test.ts',
      '**/*.props.type.test.ts',
      '**/*.hook.type.test.ts',
      ...(options.typeTestPatterns || []),
    ],
    compilerOptions: {
      jsx: 'react-jsx',
      jsxImportSource: 'react',
      strictNullChecks: true,
      strictFunctionTypes: true,
      ...options.compilerOptions,
    },
  });
}

// Export all type testing configurations
export default {
  createTypeTestingConfig,
  createNextJsTypeTestingConfig,
  createReactTypeTestingConfig,
  createNodeTypeTestingConfig,
  createApiTypeTestingConfig,
  createComponentLibraryTypeTestingConfig,
};
