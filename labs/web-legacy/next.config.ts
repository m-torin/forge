import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config } = configModule;

async function buildConfig() {
  let nextConfig = {
    ...config,
    transpilePackages: ['@repo/design-system'],
    experimental: {
      esmExternals: 'loose', // This helps with ESM compatibility
    },
    webpack: (webpackConfig: any, { isServer }: any) => {
      // Call parent config webpack function which handles edge runtime
      if (config.webpack) {
        webpackConfig = config.webpack(webpackConfig, { isServer });
      }

      // Add proper handling for ESM packages
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        extensionAlias: {
          '.js': ['.js', '.ts', '.tsx'],
          '.mjs': ['.mjs', '.mts'],
          '.cjs': ['.cjs', '.cts'],
        },
      };

      return webpackConfig;
    },
  };

  // Apply Vercel Toolbar in development
  nextConfig = withVercelToolbar()(nextConfig) as any;

  return nextConfig;
}

export default buildConfig();
