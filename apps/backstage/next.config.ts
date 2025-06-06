import { env } from '@/env';

import { config, withAnalyzer } from '@repo/config/next';

let nextConfig = config as any;

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig) as any;
}

export default nextConfig;
