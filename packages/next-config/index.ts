import withBundleAnalyzer from '@next/bundle-analyzer';
// @ts-expect-error No declaration file
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

import type { NextConfig } from 'next';

const otelRegex = /@opentelemetry\/instrumentation/;
const requireInTheMiddleRegex = /require-in-the-middle/;

export const config: NextConfig = {
  // Disable Babel completely to ensure SWC is used
  experimental: {
    typedRoutes: true,
    // Force SWC usage even if custom Babel config exists
    forceSwcTransforms: true,
    // Tree shaking optimization for commonly used packages
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
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
    remotePatterns: [],
  },

  async rewrites() {
    return [
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
    ];
  },

  // We still need minimal webpack config for plugins and warning suppression
  // even though we're using SWC for compilation
  webpack(config, { isServer }) {
    if (isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new PrismaPlugin());
    }

    config.ignoreWarnings = [{ module: otelRegex }, { module: requireInTheMiddleRegex }];

    return config;
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
