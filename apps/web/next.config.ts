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
  // Cache headers for static assets
  async headers() {
    return [
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        source: "/_next/static/:path*",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
        source: "/api/:path*",
      },
    ];
  },
  images: {
    ...config.images,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ["image/avif", "image/webp"],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for images
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
  serverExternalPackages: ["@repo/database"],
  transpilePackages: [
    ...(config.transpilePackages || []),
    "@repo/design-system",
  ],
};

export default nextConfig;
