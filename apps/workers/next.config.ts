import { config, withAnalyzer } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';

import { env } from './env';

import type { NextConfig } from 'next';

let nextConfig: NextConfig = withLogging(config);

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

// Configure server external packages to prevent posthog-node from being bundled on the client side
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

  // Provide a fallback for the 'request' module
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    request: false,
  };

  return config;
};

export default nextConfig;
