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
  serverExternalPackages: ["@repo/database"],
};

export default nextConfig;
