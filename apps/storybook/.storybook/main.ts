import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/nextjs";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const getAbsolutePath = (value: string): string =>
  dirname(require.resolve(join(value, "package.json")));

const config: StorybookConfig = {
  stories: [
    // Local stories in storybook app
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",

    // Design system stories - updated to match actual structure
    "../../../packages/design-system/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../packages/design-system/**/*.mdx",

    // App stories - keep src directory since it exists
    "../../../apps/webapp-template/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../apps/webapp-template/src/**/*.mdx",

    // Email template stories - updated to match actual structure
    "../../../apps/email/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../apps/email/**/*.mdx",

    // Studio app stories - updated to match actual structure
    "../../../apps/studio/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../apps/studio/**/*.mdx",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-measure"),
    getAbsolutePath("@storybook/addon-outline"),
    getAbsolutePath("@storybook/addon-links"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },
  staticDirs: ["../public"],
  docs: {
    autodocs: true,
    defaultName: "Documentation",
  },
  // Typescript configuration
  typescript: {
    // Enables type checking in stories
    check: true,
    // Don't fail on type errors during development
    checkOptions: {
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    },
  },
  // Core configuration for better error handling
  core: {
    disableTelemetry: true,
    enableCrashReports: false,
  },
  // Log level configuration for better error visibility
  logLevel: "warn",
};

export default config;
