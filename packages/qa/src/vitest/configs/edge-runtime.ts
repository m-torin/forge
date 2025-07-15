import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserConfig } from 'vitest/config';
import { baseConfig, getBaseTestConfig } from './base-config';
import { getVitePlugins } from './vite-utils';

// Get the directory where this file is located
const filename = fileURLToPath(import.meta.url);
const currentDir = dirname(filename);
const setupDir = resolve(currentDir, '../setup');

// Edge Runtime environment configuration
export const edgeRuntimeConfig = {
  // Supported Web APIs in edge runtime
  webApis: [
    'fetch',
    'Request',
    'Response',
    'Headers',
    'URL',
    'URLSearchParams',
    'ReadableStream',
    'WritableStream',
    'TransformStream',
    'AbortController',
    'AbortSignal',
    'Blob',
    'File',
    'FormData',
    'TextEncoder',
    'TextDecoder',
    'crypto',
    'console',
    'atob',
    'btoa',
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    'queueMicrotask',
    'structuredClone',
  ],

  // Node.js APIs that are NOT available in edge runtime
  unavailableNodeApis: [
    'fs',
    'path',
    'os',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'net',
    'tls',
    'http',
    'https',
    'http2',
    'stream',
    'util',
    'zlib',
    'crypto',
    'events',
    'buffer',
    'querystring',
    'url',
    'punycode',
    'readline',
    'repl',
    'string_decoder',
    'tty',
    'v8',
    'vm',
    'worker_threads',
    'perf_hooks',
    'async_hooks',
    'inspector',
    'module',
    'process',
    '__dirname',
    '__filename',
    'require',
    'global',
  ],

  // Polyfills for edge runtime
  polyfills: {
    // Buffer polyfill for edge runtime
    Buffer: `
      globalThis.Buffer = {
        from: (str) => new TextEncoder().encode(str),
        toString: (buffer) => new TextDecoder().decode(buffer),
        isBuffer: (obj) => obj instanceof Uint8Array,
      };
    `,

    // Process polyfill for edge runtime
    process: `
      globalThis.process = {
        env: {},
        nextTick: (fn) => queueMicrotask(fn),
        platform: 'edge',
        version: 'v18.0.0',
        versions: { node: '18.0.0' },
      };
    `,

    // Global polyfill for edge runtime
    global: `
      globalThis.global = globalThis;
    `,

    // __dirname and __filename polyfills
    dirname: `
      globalThis.__dirname = '/';
      globalThis.__filename = '/index.js';
    `,
  },

  // Edge runtime specific mocks
  mocks: {
    // Mock Node.js modules that don't exist in edge runtime
    nodeMocks: {
      fs: '{}',
      path: '{ join: (...args) => args.join("/"), resolve: (...args) => args.join("/") }',
      os: '{ platform: () => "edge" }',
      crypto: 'globalThis.crypto',
    },

    // Mock environment variables
    envMocks: {
      NODE_ENV: 'test',
      VERCEL_ENV: 'development',
      NEXT_RUNTIME: 'edge',
    },
  },
};

// Edge Runtime configuration options
export interface EdgeRuntimeOptions {
  /**
   * Additional setup files to load
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
   * Environment variables to define
   */
  env?: Record<string, string>;

  /**
   * Whether to enable Web API polyfills
   */
  enablePolyfills?: boolean;

  /**
   * Custom polyfills to add
   */
  customPolyfills?: Record<string, string>;

  /**
   * Whether to mock Node.js APIs
   */
  mockNodeApis?: boolean;

  /**
   * Custom Node.js API mocks
   */
  customNodeMocks?: Record<string, string>;

  /**
   * Whether to enable strict edge runtime mode
   */
  strictMode?: boolean;

  /**
   * Test file patterns to include
   */
  include?: string[];

  /**
   * Test timeout in milliseconds
   */
  testTimeout?: number;

  /**
   * Additional vitest config to merge
   */
  overrides?: UserConfig;
}

/**
 * Creates an edge runtime configuration for Vitest
 */
export function createEdgeRuntimeConfig(options: EdgeRuntimeOptions = {}): UserConfig {
  const {
    setupFiles = [],
    excludePaths = [],
    coverageExclude = [],
    aliases = {},
    env = {},
    enablePolyfills = true,
    customPolyfills = {},
    mockNodeApis = true,
    customNodeMocks = {},
    strictMode = false,
    testTimeout = 10000,
    overrides = {},
  } = options;

  const config: UserConfig = {
    plugins: getVitePlugins({ react: false }) as any,

    test: {
      ...getBaseTestConfig({
        environment: 'edge-runtime',
        setupFiles: [resolve(setupDir, 'edge-runtime.mjs'), ...setupFiles],
        exclude: [
          // Standard exclusions
          'node_modules',
          'dist',
          'build',
          '.next',

          // Edge runtime specific exclusions
          '**/*node*.test.*',
          '**/*server*.test.*',
          '!**/*edge*.test.*',

          // Additional exclusions
          ...excludePaths,
        ],

        include: [
          // Edge runtime specific includes
          '**/*edge*.test.*',
          '**/*middleware*.test.*',
          '**/*api*.test.*',
          '**/*.test.edge.*',
        ],

        testTimeout,
        hookTimeout: testTimeout,

        // Coverage configuration
        coverage: {
          provider: 'v8',
          exclude: [
            // Edge runtime specific coverage exclusions
            '**/node_modules/**',
            '**/dist/**',
            '**/*.config.*',
            '**/polyfills/**',
            '**/edge-runtime/**',
            ...coverageExclude,
          ],
          include: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.node.*', '!src/**/*.server.*'],
        },
      }),

      // Server configuration for edge runtime
      server: {
        deps: {
          inline: ['@repo/qa'],
        },
      },

      // Pool configuration - edge runtime should use single thread
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true,
        },
      },
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.mts'],
      alias: {
        '@': resolve(process.cwd(), './src'),
        '#/lib': resolve(process.cwd(), './src/lib'),
        '#/utils': resolve(process.cwd(), './src/utils'),
        '#/types': resolve(process.cwd(), './src/types'),
        '#/middleware': resolve(process.cwd(), './src/middleware'),
        '#/api': resolve(process.cwd(), './src/api'),
        ...aliases,
      },

      // Edge runtime specific resolve configuration
      conditions: ['edge-light', 'worker', 'import'],
    },

    define: {
      // Edge runtime environment variables
      'process.env.NODE_ENV': '"test"',
      'process.env.NEXT_RUNTIME': '"edge"',
      'process.env.VERCEL_ENV': '"development"',
      'process.env.VITEST_EDGE_RUNTIME': 'true',

      // Disable Node.js globals if in strict mode
      ...(strictMode && {
        'process.env.DISABLE_NODE_GLOBALS': 'true',
      }),

      // Custom environment variables
      ...Object.fromEntries(
        Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
    },

    // Esbuild configuration for edge runtime
    esbuild: {
      target: 'es2020',
      format: 'esm',
      platform: 'browser',
      define: {
        // Edge runtime globals
        'process.env.NODE_ENV': '"test"',
        'process.env.NEXT_RUNTIME': '"edge"',
        global: 'globalThis',
        Buffer: enablePolyfills ? 'globalThis.Buffer' : 'undefined',
        process: enablePolyfills ? 'globalThis.process' : 'undefined',
        __dirname: enablePolyfills ? 'globalThis.__dirname' : 'undefined',
        __filename: enablePolyfills ? 'globalThis.__filename' : 'undefined',
        require: 'undefined',
      },
    },

    // Optimizations for edge runtime
    optimizeDeps: {
      include: [
        // Include dependencies that work in edge runtime
        'vitest',
        '@repo/qa',
      ],
      exclude: [
        // Exclude Node.js specific dependencies
        'fs',
        'path',
        'os',
        'child_process',
        'cluster',
        'dgram',
        'dns',
        'net',
        'tls',
        'http',
        'https',
        'http2',
        'stream',
        'util',
        'zlib',
        'events',
        'buffer',
        'querystring',
        'url',
        'punycode',
        'readline',
        'repl',
        'string_decoder',
        'tty',
        'v8',
        'vm',
        'worker_threads',
        'perf_hooks',
        'async_hooks',
        'inspector',
        'module',
      ],
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
 * Creates an edge runtime configuration for Next.js middleware
 */
export function createNextJsMiddlewareConfig(options: EdgeRuntimeOptions = {}): UserConfig {
  return createEdgeRuntimeConfig({
    ...options,
    setupFiles: [resolve(setupDir, 'edge-runtime-middleware.mjs'), ...(options.setupFiles || [])],
    aliases: {
      '@': resolve(process.cwd(), './src'),
      '#/middleware': resolve(process.cwd(), './src/middleware'),
      '#/lib': resolve(process.cwd(), './src/lib'),
      '#/utils': resolve(process.cwd(), './src/utils'),
      '#/types': resolve(process.cwd(), './src/types'),
      ...options.aliases,
    },
    env: {
      NEXT_RUNTIME: 'edge',
      VERCEL_ENV: 'development',
      ...options.env,
    },
  });
}

/**
 * Creates an edge runtime configuration for API routes
 */
export function createEdgeApiConfig(options: EdgeRuntimeOptions = {}): UserConfig {
  return createEdgeRuntimeConfig({
    ...options,
    setupFiles: [resolve(setupDir, 'edge-runtime-api.mjs'), ...(options.setupFiles || [])],
    include: ['**/*api*.test.*', '**/*route*.test.*', '**/*.api.test.*', '**/*.route.test.*'],
    aliases: {
      '@': resolve(process.cwd(), './src'),
      '#/app': resolve(process.cwd(), './src/app'),
      '#/api': resolve(process.cwd(), './src/api'),
      '#/lib': resolve(process.cwd(), './src/lib'),
      '#/utils': resolve(process.cwd(), './src/utils'),
      '#/types': resolve(process.cwd(), './src/types'),
      ...options.aliases,
    },
  });
}

/**
 * Creates an edge runtime configuration for worker functions
 */
export function createEdgeWorkerConfig(options: EdgeRuntimeOptions = {}): UserConfig {
  return createEdgeRuntimeConfig({
    ...options,
    setupFiles: [resolve(setupDir, 'edge-runtime-worker.mjs'), ...(options.setupFiles || [])],
    strictMode: true, // Workers should be strict about edge runtime
    aliases: {
      '@': resolve(process.cwd(), './src'),
      '#/workers': resolve(process.cwd(), './src/workers'),
      '#/lib': resolve(process.cwd(), './src/lib'),
      '#/utils': resolve(process.cwd(), './src/utils'),
      '#/types': resolve(process.cwd(), './src/types'),
      ...options.aliases,
    },
  });
}

/**
 * Creates an edge runtime configuration for serverless functions
 */
export function createEdgeServerlessConfig(options: EdgeRuntimeOptions = {}): UserConfig {
  return createEdgeRuntimeConfig({
    ...options,
    setupFiles: [resolve(setupDir, 'edge-runtime-serverless.mjs'), ...(options.setupFiles || [])],
    testTimeout: 30000, // Serverless functions might need more time
    aliases: {
      '@': resolve(process.cwd(), './src'),
      '#/functions': resolve(process.cwd(), './src/functions'),
      '#/lib': resolve(process.cwd(), './src/lib'),
      '#/utils': resolve(process.cwd(), './src/utils'),
      '#/types': resolve(process.cwd(), './src/types'),
      ...options.aliases,
    },
  });
}

// Export edge runtime utilities
export const edgeRuntimeUtils = {
  /**
   * Check if running in edge runtime
   */
  isEdgeRuntime(): boolean {
    return process.env.NEXT_RUNTIME === 'edge' || process.env.VITEST_EDGE_RUNTIME === 'true';
  },

  /**
   * Get available Web APIs
   */
  getAvailableWebApis(): string[] {
    return edgeRuntimeConfig.webApis;
  },

  /**
   * Get unavailable Node.js APIs
   */
  getUnavailableNodeApis(): string[] {
    return edgeRuntimeConfig.unavailableNodeApis;
  },

  /**
   * Check if a Web API is available
   */
  isWebApiAvailable(api: string): boolean {
    return edgeRuntimeConfig.webApis.includes(api);
  },

  /**
   * Check if a Node.js API is available (should be false in edge runtime)
   */
  isNodeApiAvailable(api: string): boolean {
    return !edgeRuntimeConfig.unavailableNodeApis.includes(api);
  },

  /**
   * Get polyfills for edge runtime
   */
  getPolyfills(): Record<string, string> {
    return edgeRuntimeConfig.polyfills;
  },

  /**
   * Get Node.js mocks for edge runtime
   */
  getNodeMocks(): Record<string, string> {
    return edgeRuntimeConfig.mocks.nodeMocks;
  },
};

// Export all edge runtime configurations
export default {
  createEdgeRuntimeConfig,
  createNextJsMiddlewareConfig,
  createEdgeApiConfig,
  createEdgeWorkerConfig,
  createEdgeServerlessConfig,
  edgeRuntimeConfig,
  edgeRuntimeUtils,
};
