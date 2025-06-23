/// <reference path="./prisma-plugin.d.ts" />
import withBundleAnalyzer from '@next/bundle-analyzer';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import path from 'path';

// Define NextConfig interface to avoid circular imports
interface NextConfig {
  experimental?: Record<string, any>;
  compiler?: Record<string, any>;
  images?: Record<string, any>;
  rewrites?: () => Promise<Array<{ source: string; destination: string }>>;
  webpack?: (config: any, options: { isServer: boolean }) => any;
  skipTrailingSlashRedirect?: boolean;
  [key: string]: any;
}

export const config: NextConfig = {
  // Don't run ESLint during builds - handle separately
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable Babel completely to ensure SWC is used
  experimental: {
    typedRoutes: true,
    // Force SWC usage even if custom Babel config exists
    forceSwcTransforms: true,
    // Tree shaking optimization for commonly used packages
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },

  turbopack: {
    rules: {
      '*.svg': {
        as: '*.js',
        loaders: ['@svgr/webpack'],
      },
    },
  },

  // Configure SWC compiler options
  compiler: {
    // Optimize for production builds
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          destination: 'https://us-assets.i.posthog.com/static/:path*',
          source: '/ingest/static/:path*',
        },
        {
          destination: 'https://us.i.posthog.com/:path*',
          source: '/ingest/:path*',
        },
        {
          destination: 'https://us.i.posthog.com/decide',
          source: '/ingest/decide',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  // Enhanced webpack config for Prisma plugin and client-side exclusions
  webpack(config: any, { isServer }: { isServer: boolean }) {
    // Detect edge runtime context
    const isEdgeRuntime = config.target === 'webworker' || config.name === 'edge-runtime';

    if (isServer && !isEdgeRuntime) {
      // Server-side (Node.js): Add Prisma plugin for monorepo support
      config.plugins = config.plugins || [];
      config.plugins.push(new PrismaPlugin());
    } else if (!isServer || isEdgeRuntime) {
      // Client-side or Edge runtime: Prevent Node.js modules from being bundled
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Prevent Node.js modules from being bundled on client
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        child_process: false,
        readline: false,
        // Prisma-specific fallbacks
        'pg-native': false,
        'pg-query-stream': false,
        '@prisma/engines': false,
      };

      // External packages that should not be bundled on client or edge runtime
      config.externals = [
        ...(config.externals || []),
        ({ request }: any, callback: any) => {
          // Exclude Prisma client and related packages
          if (
            request.includes('@prisma/client') ||
            request.includes('@prisma/engines') ||
            request.includes('prisma')
          ) {
            return callback(null, 'commonjs ' + request);
          }

          // Exclude database workspace package
          if (request.startsWith('@repo/database')) {
            return callback(null, 'commonjs ' + request);
          }

          // Exclude node: imports
          if (request.startsWith('node:')) {
            return callback(null, 'commonjs ' + request);
          }

          // Exclude PostgreSQL native packages
          if (request.includes('pg-native') || request.includes('pg-query-stream')) {
            return callback(null, 'commonjs ' + request);
          }

          callback();
        },
      ];
    }

    // Add path aliases
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(process.cwd(), 'app'),
    };

    // Suppress webpack cache warnings about serializing big strings
    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: 'error',
    };

    // Configure webpack cache to handle large strings better
    if (config.cache && config.cache.type === 'filesystem') {
      config.cache.compression = 'gzip';
      config.cache.maxMemoryGenerations = 1;
    }

    return config;
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
} as any;

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig as any) as NextConfig;
