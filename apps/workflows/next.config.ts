import { config } from '@repo/config/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...config,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typedRoutes: true,
  experimental: {
    ...config.experimental,
    // React 19 features
    ppr: true,
    reactCompiler: true,
  },
  transpilePackages: [
    ...(config.transpilePackages || []),
    '@repo/auth',
    '@repo/internationalization',
  ],
  serverExternalPackages: ['@repo/database', 'fs', 'path', 'fs/promises'],
  // WebSocket support
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: 'http://localhost:3101/ws',
      },
    ];
  },
};

export default nextConfig;
