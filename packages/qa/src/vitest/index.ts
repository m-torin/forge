// Individual exports from configs
// Note: Mocks are not imported at top level to avoid vitest dependency during config loading
// They are imported in setup files where vitest is already available

export {
  baseConfig,
  baseTestConfig,
  createBaseConfig,
  environmentConfigs,
  getBaseTestConfig,
  poolConfigs,
  timeoutConfigs,
} from './configs/base-config';
export type { BaseConfigOptions } from './configs/base-config';

export {
  createDatabaseTestConfig,
  firestoreTestConfig,
  integrationTestConfig,
  prismaTestConfig,
  redisTestConfig,
  vectorTestConfig,
} from './configs/database';

export { createNextConfig } from './configs/next';
export type { NextConfigOptions } from './configs/next';

export { createNodeConfig } from './configs/node';

export { qstashPreset } from './configs/qstash';

export { createReactConfig } from './configs/react';
export type { ReactConfigOptions } from './configs/react';

export {
  createCustomConfig,
  createDatabasePackageConfig,
  createNextAppConfig,
  createNodePackageConfig,
  createQStashPackageConfig,
  createReactPackageConfig,
} from './configs/builders';

export {
  commonBuildConfig,
  commonCssConfig,
  commonEsbuildConfig,
  commonOptimizeDeps,
  createBrowserDefines,
  createNodePolyfills,
  createReactPlugin,
  getVitePlugins,
  mergeViteConfig,
} from './configs/vite-utils';
export type { PluginConfig } from './configs/vite-utils';

export {
  createPreset,
  databasePreset,
  integrationPreset,
  nextPreset,
  nodePreset,
  qstashPreset as qstashPresetConfig,
  reactPreset,
} from './configs/presets';

// Export mocks and test utilities
export * from './factories';
export * from './mocks';
export * from './utils/console';
export * from './utils/database';
export * from './utils/render';

// Export setup utilities (but not actual setup files to avoid side effects)
export * from './setup/dynamic-examples';
export * from './setup/package-environments';

// NOTE: Setup files are NOT exported from main index to avoid side effects.
// Import them directly:
//
// import { setupBase } from '@repo/qa/vitest/setup/base';
