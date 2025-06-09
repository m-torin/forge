import { env } from '@/env';

import { config, withAnalyzer } from '@repo/config/next';
import { withObservability } from '@repo/observability/server/next';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

let nextConfig = {
  ...config,
  eslint: {
    ignoreDuringBuilds: true,
  },
} as any;

// Apply observability configuration for Sentry
nextConfig = withObservability(nextConfig, {
  sentry: {
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,
    silent: !process.env.CI,
    tunnelRoute: '/monitoring',
    automaticVercelMonitors: true,
  },
}) as any;

// Apply Vercel Toolbar in development
nextConfig = withVercelToolbar()(nextConfig) as any;

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig) as any;
}

export default nextConfig;
