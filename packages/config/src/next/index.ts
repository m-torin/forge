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
} as const;

/**
 * Webpack configuration handler
 */
const webpackConfig = (config: any, { isServer }: { isServer: boolean }) => {
  const isEdgeRuntime = config.target === 'webworker' || config.name === 'edge-runtime';

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
  }

  // Common configuration for all environments
  configureResolve(config);
  configureLogging(config);
  configureCache(config);

  return config;
};

/**
 * Creates a handler for webpack externals
 */
const createExternalsHandler = () => {
  const patterns = [...EXTERNAL_PACKAGES.prisma, ...EXTERNAL_PACKAGES.postgres];

  return ({ request }: any, callback: any) => {
    // Check if request matches any external pattern
    const shouldExternalize =
      patterns.some(pattern => request.includes(pattern)) ||
      request.startsWith('@repo/database') ||
      request.startsWith('node:');

    if (shouldExternalize) {
      return callback(null, `commonjs ${request}`);
    }

    callback();
  };
};

/**
 * Configure webpack resolve options
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
 */
const configureLogging = (config: any) => {
  config.infrastructureLogging = {
    ...config.infrastructureLogging,
    level: 'error',
  };
};

/**
 * Configure webpack cache
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
 */
export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  })(sourceConfig);

/**
 * Helper function to merge configs
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
