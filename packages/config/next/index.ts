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

  // Minimal webpack config for Prisma plugin
  webpack(config: any, { isServer }: { isServer: boolean }) {
    if (isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new PrismaPlugin());
    }

    // Add path aliases
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(process.cwd(), 'app'),
    };

    return config;
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
} as any;

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig as any) as NextConfig;
