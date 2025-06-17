import { env } from '@/env';

import { config, withAnalyzer } from '@repo/config/next';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

async function buildConfig() {
  let nextConfig = {
    ...config,
    eslint: {
      ignoreDuringBuilds: true,
    },
    experimental: {
      ...config.experimental,
    },
    webpack: (webpackConfig: any, options: { isServer: boolean }) => {
      // First apply base config webpack configuration (Prisma plugin, path aliases)
      let finalConfig = config.webpack ? config.webpack(webpackConfig, options) : webpackConfig;

      // Then exclude server-only modules from client bundle
      if (!options.isServer) {
        finalConfig.resolve = finalConfig.resolve || {};
        finalConfig.resolve.fallback = {
          ...finalConfig.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          dns: false,
          crypto: false,
          stream: false,
          http: false,
          https: false,
          zlib: false,
          child_process: false,
        };
      }

      return finalConfig;
    },
  } as any;

  // Apply observability configuration for Sentry
  // Temporarily disabled for build:local
  // nextConfig = await withObservability(nextConfig, {
  //   sentry: {
  //     authToken: env.SENTRY_AUTH_TOKEN,
  //     org: env.SENTRY_ORG,
  //     project: env.SENTRY_PROJECT,
  //     silent: !process.env.CI,
  //     tunnelRoute: '/monitoring',
  //     automaticVercelMonitors: true,
  //     widenClientFileUpload: true,
  //     disableLogger: true,
  //     sourcemaps: {
  //       deleteSourcemapsAfterUpload: true,
  //       disable: false,
  //     },
  //   },
  // };

  // Apply Vercel Toolbar in development
  nextConfig = withVercelToolbar()(nextConfig) as any;

  if (env.ANALYZE === 'true') {
    nextConfig = withAnalyzer(nextConfig) as any;
  }

  return nextConfig;
}

export default buildConfig();
