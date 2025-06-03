import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import type { StorybookConfig } from '@storybook/nextjs';

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
    disableTelemetry: true,
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },
  staticDirs: ['../public'],
  stories: [
    '../../../packages/design-system/uix/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/ciseco/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/algolia/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
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
        'geist': require.resolve('../../../packages/design-system/uix/mocks/geist'),
      };

      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        url: false,
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
        util: require.resolve('util'),
        v8: false,
        vm: false,
        worker_threads: false,
        zlib: false,
      };
    }

    // Add plugins to handle Node.js modules
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /^(fsevents|@swc\/core)$/,
      }),
      new (require('webpack').NormalModuleReplacementPlugin)(/^node:/, (resource: any) => {
        const request = resource.request.replace(/^node:/, '');
        const mapping: Record<string, string | false> = {
          url: false,
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
      config.infrastructureLogging.level = 'verbose';
    }

    // Suppress import warnings for missing exports - we'll fix them incrementally
    config.stats = {
      ...(config.stats || {}),
      warningsFilter: [/export .* was not found/, /Critical dependency/],
    };

    // Log resolved stories
    console.log('Loading stories from:', [
      '../../../packages/design-system/uix/**/*.stories.@(js|jsx|mjs|ts|tsx)',
      '../../../packages/design-system/ciseco/**/*.stories.@(js|jsx|mjs|ts|tsx)',
      '../../../packages/design-system/algolia/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ]);

    return config;
  },
};

export default config;
