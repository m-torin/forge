import { config, withAnalyzer } from '@repo/config/next';

import { env } from './env';

import type { NextConfig } from 'next';

let nextConfig: NextConfig = config;

// Transpile packages that use node: imports
nextConfig.transpilePackages = [...(nextConfig.transpilePackages || []), '@repo/orchestration'];

// Sentry integration removed

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig as any) as NextConfig;
}

// Configure server external packages to prevent certain packages from being bundled on the client side
nextConfig.serverExternalPackages = [...(nextConfig.serverExternalPackages || []), 'posthog-node'];

// Node.js runtime for middleware is now enabled in the shared config

// Handle the missing 'request' module from retry-request (used by Google Cloud SDK)
const originalWebpack = nextConfig.webpack;
nextConfig.webpack = (config, options): any => {
  // Call the original webpack config if it exists
  if (originalWebpack) {
    config = originalWebpack(config, options);
  }

  // Provide a fallback for the 'request' module and node:crypto
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    request: false,
  };

  // Handle node: protocol imports
  config.resolve.alias = {
    ...config.resolve.alias,
    'node:crypto': require.resolve('crypto-browserify'),
  };

  return config;
};

export default nextConfig;
