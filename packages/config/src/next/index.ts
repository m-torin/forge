/**
 * Optimized Next.js configuration for monorepo apps
 * Includes Prisma plugin, bundle optimization, and PostHog analytics setup
 */

/// <reference path="./prisma-plugin.d.ts" />
import withBundleAnalyzer from '@next/bundle-analyzer';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import type { NextConfig } from 'next';
import path from 'path';

// Environment helpers
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

// Constants for better maintainability
const OPTIMIZED_PACKAGES = ['@mantine/core', '@mantine/hooks'];

const IMAGE_DOMAINS = [
  { hostname: 'images.pexels.com' },
  { hostname: 'images.unsplash.com' },
] as const;

const POSTHOG_REWRITES = [
  { source: '/ingest/static/:path*', destination: 'https://us-assets.i.posthog.com/static/:path*' },
  { source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' },
  { source: '/ingest/decide', destination: 'https://us.i.posthog.com/decide' },
] as const;

// Node.js built-in modules to exclude from client bundle
const NODE_BUILTINS = [
  'fs',
  'net',
  'tls',
  'dns',
  'crypto',
  'stream',
  'http',
  'https',
  'zlib',
  'child_process',
  'readline',
] as const;

// Packages to externalize on client/edge
const EXTERNAL_PACKAGES = {
  prisma: ['@prisma/client', '@prisma/engines', 'prisma'],
  database: ['@repo/database'],
  postgres: ['pg-native', 'pg-query-stream'],
  observability: [
    '@logtail/js',
    '@logtail/next',
    '@logtape/cloudwatch-logs',
    '@logtape/file',
    '@logtape/logtape',
    '@logtape/sentry',
  ],
} as const;

/**
 * Webpack configuration handler
 * @param config - Webpack configuration object
 * @param options - Next.js context options
 * @returns Modified webpack configuration
 */
const webpackConfig = (config: any, { isServer }: { isServer: boolean }) => {
  const isEdgeRuntime = config.target === 'webworker' || config.name === 'edge-runtime';

  // Suppress OpenTelemetry warnings from Sentry/observability packages
  // This warning occurs because OpenTelemetry instrumentation packages use dynamic
  // requires that webpack cannot statically analyze. This is safe to suppress as
  // these warnings don't affect runtime functionality.
  //
  // Context: When using @sentry/nextjs or other observability tools, they often
  // include OpenTelemetry instrumentation that uses the 'require-in-the-middle'
  // package for dynamic patching. Webpack shows warnings about not being able
  // to statically analyze these requires, but this is expected behavior.
  //
  // For more information, see:
  // - https://github.com/open-telemetry/opentelemetry-js/issues/4173
  // - https://docs.sentry.io/platforms/javascript/guides/nextjs/troubleshooting/#webpack-warnings
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    {
      module: /require-in-the-middle/,
      message:
        /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
    },
    {
      module: /@opentelemetry\/instrumentation/,
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ];

  // Server-side Node.js configuration
  if (isServer && !isEdgeRuntime) {
    config.plugins ??= [];
    config.plugins.push(new PrismaPlugin());
  }

  // Client-side or Edge runtime configuration
  if (!isServer || isEdgeRuntime) {
    // Configure fallbacks for Node.js modules
    config.resolve ??= {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ...Object.fromEntries(NODE_BUILTINS.map(mod => [mod, false])),
      'pg-native': false,
      'pg-query-stream': false,
      '@prisma/engines': false,
    };

    // Configure externals
    config.externals = [...(config.externals || []), createExternalsHandler()];

    // Exclude test files from client bundles
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /__tests__/,
        /\.test\.(ts|tsx|js|jsx)$/,
        /\.spec\.(ts|tsx|js|jsx)$/,
      ],
      use: [],
    });
  }

  // Common configuration for all environments
  configureResolve(config);
  configureLogging(config);
  configureCache(config);

  return config;
};

/**
 * Creates a handler for webpack externals
 * @returns External handler function for webpack
 */
const createExternalsHandler = () => {
  const patterns = [
    ...EXTERNAL_PACKAGES.prisma,
    ...EXTERNAL_PACKAGES.postgres,
    ...EXTERNAL_PACKAGES.observability,
  ];

  return ({ request }: any, callback: any) => {
    // Check if request matches any external pattern
    const shouldExternalize =
      patterns.some(pattern => request.includes(pattern)) || request.startsWith('node:');

    // Handle @repo/database more granularly based on package.json exports
    if (request.startsWith('@repo/database')) {
      // Allow these specific client-safe exports
      const allowedClientExports = [
        '@repo/database/env',
        '@repo/database/types',
        '@repo/database/zod',
        '@repo/database/prisma/zod',
        '@repo/database/prisma/generated',
        '@repo/database/keys', // Legacy support
      ];

      const isClientSafe = allowedClientExports.some(
        allowed => request === allowed || request.startsWith(`${allowed}/`),
      );

      if (!isClientSafe) {
        return callback(null, `commonjs ${request}`);
      }
    }

    if (shouldExternalize) {
      return callback(null, `commonjs ${request}`);
    }

    callback();
  };
};

/**
 * Configure webpack resolve options
 * @param config - Webpack configuration object
 */
const configureResolve = (config: any) => {
  config.resolve ??= {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.join(process.cwd(), 'app'),
  };
};

/**
 * Configure webpack logging
 * @param config - Webpack configuration object
 */
const configureLogging = (config: any) => {
  config.infrastructureLogging = {
    ...config.infrastructureLogging,
    level: 'error',
  };
};

/**
 * Configure webpack cache
 * @param config - Webpack configuration object
 */
const configureCache = (config: any) => {
  if (config.cache?.type === 'filesystem') {
    Object.assign(config.cache, {
      compression: 'gzip',
      maxMemoryGenerations: 1,
    });
  }
};

/**
 * Main Next.js configuration
 */
export const config: NextConfig = {
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental features
  experimental: {
    typedRoutes: true,
    forceSwcTransforms: true,
    optimizePackageImports: OPTIMIZED_PACKAGES,
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        as: '*.js',
        loaders: ['@svgr/webpack'],
      },
    },
  },

  // SWC compiler configuration
  compiler: {
    reactRemoveProperties: isProd,
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: IMAGE_DOMAINS.map(({ hostname }) => ({
      protocol: 'https' as const,
      hostname,
      port: '',
      pathname: '/**',
    })),
  },

  // URL rewrites for PostHog
  async rewrites() {
    return {
      beforeFiles: POSTHOG_REWRITES.map(rewrite => ({ ...rewrite })),
      afterFiles: [],
      fallback: [],
    };
  },

  // Webpack configuration
  webpack: webpackConfig,

  // Support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

/**
 * Higher-order function to add bundle analyzer
 * @param sourceConfig - Base Next.js configuration
 * @returns Configuration with bundle analyzer enabled
 */
export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  })(sourceConfig);

/**
 * Helper function to merge configs
 * @param base - Base configuration
 * @param configs - Additional configurations to merge
 * @returns Merged Next.js configuration
 */
export const mergeConfig = (base: NextConfig, ...configs: Partial<NextConfig>[]): NextConfig => {
  return configs.reduce((acc, config) => {
    const merged = { ...acc };

    // Deep merge experimental
    if (config.experimental) {
      merged.experimental = { ...acc.experimental, ...config.experimental };
    }

    // Deep merge images
    if (config.images) {
      merged.images = {
        ...acc.images,
        ...config.images,
        remotePatterns: [
          ...(acc.images?.remotePatterns || []),
          ...(config.images.remotePatterns || []),
        ],
      };
    }

    // Merge other top-level properties
    return { ...merged, ...config };
  }, base);
};
