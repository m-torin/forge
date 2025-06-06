import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // React 19 features
    ppr: true,
    reactCompiler: true,
  },
  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.ts': ['tsx', '--loader=ts'],
    },
  },
  // WebSocket support
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: 'http://localhost:3101/ws',
      },
    ];
  },
  // Development optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Hot reload workflows
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.next/**'],
        poll: 1000,
      };
    }
    return config;
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
