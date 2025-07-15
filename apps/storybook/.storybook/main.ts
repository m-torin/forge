import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { StorybookConfig } from '@storybook/nextjs';

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const getAbsolutePath = (value: string) => dirname(require.resolve(join(value, 'package.json')));

const config: StorybookConfig = {
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  core: {
    builder: {
      name: '@storybook/builder-webpack5',
      options: {
        lazyCompilation: true,
        fsCache: true, // Enable filesystem caching
      },
    },
    disableTelemetry: true,
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },
  staticDirs: ['../public'],
  stories: [
    // Only include stories from the storybook app itself and design system
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Remove app stories to avoid conflicts and slow builds
    // '../../../apps/web/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // '../../../apps/backstage*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // '../../../apps/ai-chatbot*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  typescript: {
    check: false,
    reactDocgen: false, // Disable react-docgen to prevent hanging
  },
  webpackFinal: async (config: any) => {
    // Add resolution aliases for auth mocking
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Alias @repo/auth/client to our mock implementation
        '@repo/auth/client': require.resolve('../../../packages/auth/mocks/storybook-client'),
        // Mock geist fonts for Storybook
        'geist/font/mono': require.resolve('../../../packages/design-system/uix/mocks/geist-mono'),
        'geist/font/sans': require.resolve('../../../packages/design-system/uix/mocks/geist-sans'),
      };

      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        assert: false,
        async_hooks: false,
        buffer: require.resolve('buffer'),
        child_process: false,
        cluster: false,
        constants: false,
        crypto: require.resolve('crypto-browserify'),
        dgram: false,
        dns: false,
        events: require.resolve('events'),
        fs: false,
        http: false,
        http2: false,
        https: false,
        inspector: false,
        module: false,
        net: false,
        'node:buffer': require.resolve('buffer'),
        'node:crypto': require.resolve('crypto-browserify'),
        // Handle node: schemes
        'node:events': require.resolve('events'),
        'node:path': require.resolve('path-browserify'),
        'node:process': require.resolve('process/browser'),
        'node:stream': require.resolve('stream-browserify'),
        'node:util': require.resolve('util'),
        os: false,
        path: require.resolve('path-browserify'),
        perf_hooks: false,
        process: require.resolve('process/browser'),
        querystring: false,
        readline: false,
        repl: false,
        stream: require.resolve('stream-browserify'),
        string_decoder: require.resolve('string_decoder'),
        tls: false,
        url: false,
        util: require.resolve('util'),
        v8: false,
        vm: false,
        worker_threads: false,
        zlib: false,
      };
    }

    // Add plugins to handle Node.js modules
    config.plugins = config.plugins ?? [];
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /^(fsevents|@swc\/core)$/,
      }),
      new (require('webpack').NormalModuleReplacementPlugin)(/^node:/, (resource: any) => {
        const request = resource.request.replace(/^node:/, '');
        const mapping: Record<string, false | string> = {
          assert: false,
          async_hooks: false,
          buffer: require.resolve('buffer'),
          child_process: false,
          cluster: false,
          constants: false,
          crypto: require.resolve('crypto-browserify'),
          dgram: false,
          dns: false,
          events: require.resolve('events'),
          fs: false,
          http: false,
          https: false,
          inspector: false,
          module: false,
          net: false,
          os: false,
          path: require.resolve('path-browserify'),
          perf_hooks: false,
          process: require.resolve('process/browser'),
          querystring: false,
          readline: false,
          repl: false,
          stream: require.resolve('stream-browserify'),
          tls: false,
          url: false,
          util: require.resolve('util'),
          v8: false,
          vm: false,
          worker_threads: false,
          zlib: false,
        };
        if (Object.prototype.hasOwnProperty.call(mapping, request)) {
          if (mapping[request] === false) {
            // Point to an empty module for Node.js modules that can't be polyfilled
            resource.request = require.resolve('../empty-module.js');
          } else {
            resource.request = mapping[request];
          }
        }
      }),
    );

    // Enable debugging of stories to find errors
    if (config.infrastructureLogging) {
      config.infrastructureLogging.level = 'error';
    }

    // Suppress import warnings for missing exports - we'll fix them incrementally
    config.stats = {
      ...(config.stats ?? {}),
      logging: 'error',
      loggingDebug: false,
      warningsFilter: [/export .* was not found/, /Critical dependency/],
    };

    // Add performance optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },
};

export default config;
