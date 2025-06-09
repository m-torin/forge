import { config } from '@repo/config/next';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...config,
  experimental: {
    ...config.experimental,
    typedRoutes: true,
  },
};

export default nextConfig;
