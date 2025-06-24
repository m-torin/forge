import { withSentryConfig } from '@sentry/nextjs';

// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config } = configModule;

async function buildConfig() {
  const nextConfig = {
    ...config,
    basePath: '/authmgmt',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/authmgmt' : undefined,
  };

  return withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: 'o1116743',
    project: 'javascript-nextjs',

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,
  });
}

export default buildConfig();
