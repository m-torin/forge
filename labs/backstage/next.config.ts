import { env } from '@/env';
import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config, withAnalyzer } = configModule;


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

        // External packages that should not be bundled on client/edge
        finalConfig.externals = [
          ...(finalConfig.externals || []),
          ({ request }: any, callback: any) => {
            // Exclude OpenTelemetry packages from client/edge bundle
            if (request.startsWith('@opentelemetry/')) {
              return callback(null, 'commonjs ' + request);
            }


            callback();
          },
        ];
      }

      // Add specific exclusions for Prisma-generated code and database packages
      finalConfig.externals = [
        ...(finalConfig.externals || []),
        ({ request }: any, callback: any) => {
          // Exclude all database-related packages
          if (request.startsWith('@repo/database')) {
            return callback(null, 'commonjs ' + request);
          }

          // Exclude Prisma client and related packages
          if (request.includes('@prisma/client') || request.includes('prisma')) {
            return callback(null, 'commonjs ' + request);
          }

          // Exclude Prisma-generated actions
          if (request.includes('server-actions') || request.includes('orm')) {
            return callback(null, 'commonjs ' + request);
          }

          // Exclude auth package server exports
          if (request.startsWith('@repo/auth/server')) {
            return callback(null, 'commonjs ' + request);
          }

          // Exclude storage package server exports
          if (request.startsWith('@repo/storage/server')) {
            return callback(null, 'commonjs ' + request);
          }

          callback();
        },
      ];

      // Increase webpack memory limit and optimize chunk splitting
      finalConfig.optimization = finalConfig.optimization || {};
      finalConfig.optimization.splitChunks = {
        ...finalConfig.optimization.splitChunks,
        maxSize: 244000,
        cacheGroups: {
          ...finalConfig.optimization.splitChunks?.cacheGroups,
          prisma: {
            test: /[\\/]node_modules[\\/]@prisma[\\/]/,
            name: 'prisma',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          database: {
            test: /[\\/]packages[\\/]database[\\/]/,
            name: 'database',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          serverActions: {
            test: /[\\/]server-actions[\\/]/,
            name: 'server-actions',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
        },
      };

      // Disable webpack cache for large strings
      finalConfig.cache = false;

      return finalConfig;
    },
  } as any;


  // Apply Vercel Toolbar in development
  nextConfig = withVercelToolbar()(nextConfig) as any;

  if (env.ANALYZE === 'true') {
    nextConfig = withAnalyzer(nextConfig) as any;
  }

  return nextConfig;
}

export default buildConfig();
