import { config } from '@repo/next-config';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...config,
  experimental: {
    ...config.experimental,
    typedRoutes: true,
  },
  images: {
    ...config.images,
    minimumCacheTTL: 2678400 * 12, // 6 months
    remotePatterns: [
      ...(config.images?.remotePatterns || []),
      {
        hostname: 'images.pexels.com',
        pathname: '/**',
        port: '',
        protocol: 'https',
      },
      {
        hostname: 'images.unsplash.com',
        pathname: '/**',
        port: '',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
