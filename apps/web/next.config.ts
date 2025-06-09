import { withVercelToolbar } from "@vercel/toolbar/plugins/next";

import { config } from "@repo/config/next";
import { withObservability } from "@repo/observability/server/next";

import type { NextConfig } from "next";
import { env } from "./env";

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
    // Temporarily disable PPR for debugging
    // ppr: true,
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
  serverExternalPackages: [
    "@repo/database"
  ],
  transpilePackages: [
    ...(config.transpilePackages || []),
    "@repo/design-system",
  ],
};

export default withVercelToolbar()(
  withObservability(nextConfig, {
    sentry: {
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
      tunnelRoute: "/monitoring",

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,

      // Enables automatic instrumentation of Vercel Cron Monitors
      automaticVercelMonitors: true,
    },
  })
);
