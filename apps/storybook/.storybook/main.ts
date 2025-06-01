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
  stories: [
    '../stories/**/*.mdx',
    '../../../packages/design-system/uix/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/ciesco2/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/gluestack/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/algolia/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
  webpackFinal: async (config) => {
    // Add resolution aliases for auth mocking and React Native Web
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Alias @repo/auth/client to our mock implementation
        '@repo/auth/client': require.resolve('../../../packages/auth/mocks/storybook-client'),
        // React Native Web aliases
        'react-native$': 'react-native-web',
        'react-native/Libraries/Image/AssetRegistry':
          'react-native-web/dist/modules/AssetRegistry',
        'react-native/Libraries/Image/resolveAssetSource':
          'react-native-web/dist/modules/resolveAssetSource',
      };
      
      // Add React Native Web extensions
      config.resolve.extensions = [
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        ...(config.resolve.extensions || []),
      ];

      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'child_process': false,
        'fs': false,
        'os': false,
        'net': false,
        'tls': false,
        'dns': false,
        'http': false,
        'https': false,
        'http2': false,
        'zlib': false,
        'url': false,
        'querystring': false,
        'worker_threads': false,
        'cluster': false,
        'dgram': false,
        'readline': false,
        'repl': false,
        'v8': false,
        'vm': false,
        'async_hooks': false,
        'perf_hooks': false,
        'inspector': false,
        'module': false,
        'constants': false,
        'assert': false,
        'path': require.resolve('path-browserify'),
        'crypto': require.resolve('crypto-browserify'),
        'stream': require.resolve('stream-browserify'),
        'util': require.resolve('util'),
        'buffer': require.resolve('buffer'),
        'process': require.resolve('process/browser'),
        'events': require.resolve('events'),
        'string_decoder': require.resolve('string_decoder'),
        // Handle node: schemes
        'node:events': require.resolve('events'),
        'node:path': require.resolve('path-browserify'),
        'node:crypto': require.resolve('crypto-browserify'),
        'node:stream': require.resolve('stream-browserify'),
        'node:util': require.resolve('util'),
        'node:buffer': require.resolve('buffer'),
        'node:process': require.resolve('process/browser'),
      };
    }

    // Add plugins to handle Node.js modules
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack')).IgnorePlugin({
        resourceRegExp: /^(fsevents|@swc\/core)$/,
      }),
      new (require('webpack')).NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          const request = resource.request.replace(/^node:/, '');
          const mapping = {
            'events': require.resolve('events'),
            'path': require.resolve('path-browserify'),
            'crypto': require.resolve('crypto-browserify'),
            'stream': require.resolve('stream-browserify'),
            'util': require.resolve('util'),
            'buffer': require.resolve('buffer'),
            'process': require.resolve('process/browser'),
            'fs': false,
            'os': false,
            'net': false,
            'tls': false,
            'dns': false,
            'http': false,
            'https': false,
            'zlib': false,
            'url': false,
            'querystring': false,
            'child_process': false,
            'worker_threads': false,
            'cluster': false,
            'dgram': false,
            'readline': false,
            'repl': false,
            'v8': false,
            'vm': false,
            'async_hooks': false,
            'perf_hooks': false,
            'inspector': false,
            'module': false,
            'constants': false,
            'assert': false,
          };
          if (mapping.hasOwnProperty(request)) {
            if (mapping[request] === false) {
              // Point to an empty module for Node.js modules that can't be polyfilled
              resource.request = require.resolve('../empty-module.js');
            } else {
              resource.request = mapping[request];
            }
          }
        }
      )
    );

    // Enable debugging of stories to find errors
    if (config.infrastructureLogging) {
      config.infrastructureLogging.level = 'verbose';
    }

    // Suppress import warnings for missing exports - we'll fix them incrementally
    config.stats = {
      ...config.stats,
      warningsFilter: [
        /export .* was not found/,
        /Critical dependency/
      ]
    };

    // Log resolved stories
    console.log('Loading stories from:', [
      '../stories/**/*.mdx',
      '../../../packages/design-system/uix/**/*.stories.@(js|jsx|mjs|ts|tsx)',
      '../../../packages/design-system/ciesco2/**/*.stories.@(js|jsx|mjs|ts|tsx)',
      '../../../packages/design-system/gluestack/**/*.stories.@(js|jsx|mjs|ts|tsx)',
      '../../../packages/design-system/algolia/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ]);

    return config;
  },
};

export default config;
