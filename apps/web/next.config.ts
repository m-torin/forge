import { withSentryConfig } from "@sentry/nextjs";

// Note: Next.js config compilation requires CommonJS require for workspace imports
// eslint-disable-next-line @typescript-eslint/no-require-imports
const configModule = require("@repo/config/next");
const { config } = configModule;

const nextConfig = {
  ...config,
  experimental: {
    ...config.experimental,
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
    ppr: "incremental",
    reactCompiler: true,
    typedRoutes: true,
  },
  transpilePackages: [
    ...(config.transpilePackages || []),
    "@repo/internationalization",
  ],
  images: {
    ...config.images,
    remotePatterns: [
      ...(config.images?.remotePatterns || []),
      {
        protocol: "https",
        hostname: "nextjs.org",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
});
