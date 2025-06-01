import { config, withAnalyzer } from "@repo/config/next";
import { withLogging, withSentry } from "@repo/observability/next-wrappers";

import { env } from "./env";

import type { NextConfig } from "next";

let nextConfig: NextConfig = withLogging({
  ...config,
  experimental: {
    typedRoutes: true,
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/form",
    ],
  },
});

// Configure server external packages to prevent posthog-node from being bundled on the client side
nextConfig.serverExternalPackages = [
  ...(nextConfig.serverExternalPackages || []),
  "posthog-node",
];

// Configure webpack to handle fsevents
nextConfig.webpack = (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
  }
  
  // Ignore fsevents which is macOS only
  config.externals = [...(config.externals || []), { fsevents: "fsevents" }];
  
  return config;
};

if (process.env.NODE_ENV === "production") {
  const redirects: NextConfig["redirects"] = async () => [
    {
      destination: "/legal/privacy",
      source: "/legal",
      statusCode: 301,
    },
  ];

  nextConfig.redirects = redirects;
}

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig as any) as NextConfig;
}

export default nextConfig as NextConfig;
