import type { NextConfig } from 'next';
import config from '@repo/config/next';

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  }
};

export default config(nextConfig);
