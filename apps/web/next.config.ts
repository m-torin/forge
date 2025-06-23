import {withSentryConfig} from "@sentry/nextjs";
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
    reactCompiler: true, // Re-enabled after fixing server/client boundary issues
  },
  // Configure turbopack separately (stable feature)
  turbopack: process.env.NODE_ENV === "development" && !process.env.SENTRY_DSN ? {
    ...config.turbopack,
  } : undefined,
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
  // Conditionally add webpack config for SVG handling when not using turbopack
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Only add SVG handling when not using turbopack
    if (!dev || process.env.SENTRY_DSN) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      });
    }
    return config;
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "agrippan",
project: "lfm-web",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});