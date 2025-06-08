import type { NextConfig } from 'next';
import config from '@repo/next-config';

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

export default config(nextConfig);
