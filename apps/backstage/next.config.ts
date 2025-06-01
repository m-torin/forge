import { env } from '@/env';

import { config, withAnalyzer } from '@repo/config/next';
import { withLogging, withSentry } from '@repo/observability/next-wrappers';

let nextConfig = withLogging(config) as any;

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig) as any;
}

// Configure server external packages to prevent posthog-node from being bundled on the client side
nextConfig.serverExternalPackages = [...(nextConfig.serverExternalPackages || []), 'posthog-node'];

export default nextConfig;
