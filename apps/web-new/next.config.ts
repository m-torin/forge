import { config } from "@repo/config/next";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...config,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    ...config.experimental,
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
    // Enable PPR for select routes
    ppr: true,
  },
  images: {
    ...config.images,
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      ...(config.images?.remotePatterns || []),
      {
        hostname: "images.pexels.com",
        pathname: "/**",
        port: "",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        pathname: "/**",
        port: "",
        protocol: "https",
      },
      {
        hostname: "res.cloudinary.com",
        pathname: "/**",
        port: "",
        protocol: "https",
      },
    ],
  },
  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
  serverExternalPackages: ["@repo/database"],
  transpilePackages: [
    ...(config.transpilePackages || []),
    "@repo/design-system",
  ],
};

export default nextConfig;
