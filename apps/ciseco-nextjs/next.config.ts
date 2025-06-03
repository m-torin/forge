import { config } from '@repo/config/next';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...config,
  transpilePackages: [...(config.transpilePackages || []), '@repo/design-system'],
  images: {
    ...config.images,
    minimumCacheTTL: 2678400 * 12, // 6 months
    remotePatterns: [
      ...(config.images?.remotePatterns || []),
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
