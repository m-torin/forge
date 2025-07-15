// Main exports - users should import from these specific paths:
// - @repo/qa/vitest
// - @repo/qa/playwright
// - @repo/qa/shared

// Re-export vitest configs only (not all vitest exports to avoid duplicates)
export {
  applyPackageMocks,
  baseConfig,
  baseTestConfig,
  commonBuildConfig,
  commonCssConfig,
  commonEsbuildConfig,
  commonOptimizeDeps,
  createBaseConfig,
  createBrowserDefines,
  createCustomConfig,
  createDatabasePackageConfig,
  createDatabaseTestConfig,
  createNextAppConfig,
  createNextConfig,
  createNodeConfig,
  createNodePackageConfig,
  createNodePolyfills,
  createPreset,
  createQStashPackageConfig,
  createReactConfig,
  createReactPackageConfig,
  createReactPlugin,
  databasePreset,
  environmentConfigs,
  firestoreTestConfig,
  getBaseTestConfig,
  getVitePlugins,
  integrationPreset,
  integrationTestConfig,
  mergeViteConfig,
  nextPreset,
  nodePreset,
  poolConfigs,
  prismaTestConfig,
  qstashPreset,
  reactPreset,
  redisTestConfig,
  setupDynamicEnvironment,
  setupPackage,
  setupPackageEnvironment,
  timeoutConfigs,
  vectorTestConfig,
} from './src/vitest';

export type {
  BaseConfigOptions,
  CustomEnvironment,
  DynamicEnvironmentConfig,
  EnvironmentPredicate,
  NextConfigOptions,
  PluginConfig,
  ReactConfigOptions,
} from './src/vitest';

// Re-export playwright for backward compatibility
export * from './src/playwright';

// Re-export shared for backward compatibility
export * from './src/shared';
