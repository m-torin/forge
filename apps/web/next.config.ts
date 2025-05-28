import { withToolbar } from "@repo/feature-flags/lib/toolbar";
import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";

import { env } from "./env";

import type { NextConfig } from "next";

let nextConfig: NextConfig = withToolbar(
  withLogging({
    ...config,
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },
    experimental: {
      nodeMiddleware: true,
      typedRoutes: true,
      optimizePackageImports: [
        "@mantine/core",
        "@mantine/hooks",
        "@mantine/form",
      ],
    },
  }),
);

// Configure server external packages to prevent posthog-node from being bundled on the client side
nextConfig.serverExternalPackages = [
  ...(nextConfig.serverExternalPackages || []),
  "posthog-node",
];

if (process.env.NODE_ENV === "production") {
  const redirects: NextConfig["redirects"] = async () => [
    // Add your production redirects here
  ];

  nextConfig.redirects = redirects;
}

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
