import type { NextConfig } from 'next';

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    additionalData: `@use "./src/styles/_mantine" as *;`,
    implementation: 'sass-embedded',
  },
  images: {
    domains: [
      // Add any external image domains you need here
    ],
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  // Consider removing this in production to enable ESLint checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/flow/new',
        destination: '/flows/new',
        permanent: true,
      },
      {
        source: '/flow',
        destination: '/flows',
        permanent: true,
      },
      {
        source: '/flows/:cuid((?!new$|convert$).*)',
        destination: '/flow/:cuid',
        permanent: true,
      },
    ];
  },
} as NextConfig;

export default nextConfig;
