// Vitest configurations
export * from './configs';

// Vitest mocks
export * from './mocks/auth';
export * from './mocks/browser';
export * from './mocks/firestore';
export * from './mocks/next';
export * from './mocks/upstash-redis';
export * from './mocks/upstash-vector';

// Vitest setup utilities
export { setTestEnv, suppressConsoleErrors } from './setup/common';
export * from './setup/database';
export * from './setup/integration';
export * from './setup/nextjs';

// Vitest utilities
export * from './utils/database';
export * from './utils/render';

// Vitest presets
export {
  reactPreset,
  nodePreset,
  nextPreset,
  databasePreset,
  integrationPreset,
  createPreset,
  default as defaultPreset,
} from './vitest-presets';
