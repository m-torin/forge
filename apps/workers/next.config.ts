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
nextConfig.experimental = {
  ...nextConfig.experimental,
  nodeMiddleware: true,
};

export default nextConfig;
