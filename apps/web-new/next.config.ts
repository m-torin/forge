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
  },
  images: {
    ...config.images,
    minimumCacheTTL: 2678400 * 12, // 6 months
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
    ],
  },
  serverExternalPackages: ["@repo/database"],
  transpilePackages: [
    ...(config.transpilePackages || []),
    "@repo/design-system",
  ],
};

export default nextConfig;
