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
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/design-system/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath("@storybook/addon-docs")
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
    // Add resolution aliases for auth mocking
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Alias @repo/auth/client to our mock implementation
        '@repo/auth/client': require.resolve('../../../packages/auth/mocks/storybook-client'),
      };
    }

    // Enable debugging of stories to find errors
    if (config.infrastructureLogging) {
      config.infrastructureLogging.level = 'verbose';
    }

    // Log resolved stories
    console.log('Loading stories from:', [
      '../stories/**/*.mdx',
      '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
      '../../../packages/design-system/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ]);

    return config;
  },
};

export default config;
