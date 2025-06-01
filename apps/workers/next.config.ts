import { config, withAnalyzer } from '@repo/config/next';
import { withLogging, withSentry } from '@repo/observability/next-wrappers';

import { env } from './env';

import type { NextConfig } from 'next';

let nextConfig: NextConfig = withLogging(config);

// Transpile packages that use node: imports
nextConfig.transpilePackages = [...(nextConfig.transpilePackages || []), '@repo/orchestration'];

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig as any) as NextConfig;
}

// Configure server external packages to prevent certain packages from being bundled on the client side
nextConfig.serverExternalPackages = [...(nextConfig.serverExternalPackages || []), 'posthog-node'];

// Enable Node.js runtime for middleware (available in Next.js 15.2 canary)
// Temporarily disabled until we update to the latest canary
// nextConfig.experimental = {
//   ...nextConfig.experimental,
//   nodeMiddleware: true,
// };

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
