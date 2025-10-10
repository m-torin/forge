import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  transpilePackages: ['swr'],
  webpack: (config, { isServer }) => {
    // SWR compatibility: Alias to wrapper that provides default export
    // This fixes @ai-sdk/react expecting "import useSWR from 'swr'"
    // when SWR v2+ only has named exports
    config.resolve.alias = {
      ...config.resolve.alias,
      swr$: path.resolve(__dirname, 'lib/swr-compat.js'),
    };

    if (!isServer) {
      // Fallbacks for Node.js modules in client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        readline: false,
      };
    }
    return config;
  },
};

export default nextConfig;
