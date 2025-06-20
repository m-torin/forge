import { env } from '@/env';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config, withAnalyzer } = configModule;

// @ts-ignore - Next.js transpilation issue with workspace imports
const observabilityModule = require('../../packages/observability/src/server-next.ts');
const { withSentry } = observabilityModule;

async function buildConfig() {
  let nextConfig = {
    ...config,
    transpilePackages: ['@repo/observability'],
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

  // Apply Sentry configuration using observability package
  if (env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      nextConfig = await withSentry(nextConfig, {
        authToken: env.SENTRY_AUTH_TOKEN,
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        silent: !process.env.CI,
        tunnelRoute: '/monitoring',
        automaticVercelMonitors: true,
        widenClientFileUpload: true,
        disableLogger: true,
        sourcemaps: {
          deleteSourcemapsAfterUpload: true,
          disable: false,
        },
      });
    } catch (error) {
      console.warn('Could not initialize Sentry build integration:', error);
    }
  }

  // Apply Vercel Toolbar in development
  nextConfig = withVercelToolbar()(nextConfig) as any;

  if (env.ANALYZE === 'true') {
    nextConfig = withAnalyzer(nextConfig) as any;
  }

  return nextConfig;
}

export default buildConfig();
