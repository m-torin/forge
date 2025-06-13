import { withVercelToolbar } from '@vercel/toolbar/plugins/next';

import { config } from '@repo/config/next';

const nextConfig = {
  ...config,
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

// Apply Vercel Toolbar in development
const finalConfig = withVercelToolbar()(nextConfig);

export default finalConfig;
