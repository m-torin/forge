// Config-only exports - no vitest runtime dependencies
// Use this for vitest.config.ts files

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
