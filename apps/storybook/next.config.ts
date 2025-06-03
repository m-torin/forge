import { config } from '@repo/config/next';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...config,
  reactStrictMode: true,
};

export default nextConfig;
