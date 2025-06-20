import { env } from '@/env';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config } = configModule;

// @ts-ignore - Next.js transpilation issue with workspace imports
const observabilityModule = require('../../packages/observability/src/server-next.ts');
const { withSentry } = observabilityModule;

async function buildConfig() {
  let nextConfig = {
    ...config,
    transpilePackages: ['@repo/observability'],
    webpack: (webpackConfig: any, { isServer }: any) => {
      if (!isServer) {
        // Prevent node modules from being bundled on client side
        webpackConfig.resolve.fallback = {
          ...webpackConfig.resolve.fallback,
          fs: false,
          readline: false,
        };

        // Ignore node: imports in client bundle
        webpackConfig.externals = [
          ...(webpackConfig.externals || []),
          ({ request }: any, callback: any) => {
            if (request.startsWith('node:')) {
              return callback(null, 'commonjs ' + request);
            }
            // Ignore Segment packages if not installed
            if (request.startsWith('@segment/')) {
              return callback(null, 'commonjs ' + request);
            }
            callback();
          },
        ];
      }

      // Call parent config webpack if it exists
      if (config.webpack) {
        return config.webpack(webpackConfig, { isServer });
      }

      return webpackConfig;
    },
  };

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

  return nextConfig;
}

export default buildConfig();
