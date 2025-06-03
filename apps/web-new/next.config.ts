import { config } from '@repo/config/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...config,
  experimental: {
    ...config.experimental,
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@repo/database'],
};

export default nextConfig;