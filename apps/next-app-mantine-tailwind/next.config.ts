import { config as baseConfig } from '@repo/next-config';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...baseConfig,
  experimental: {
    ...baseConfig.experimental,
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
};

export default nextConfig;
