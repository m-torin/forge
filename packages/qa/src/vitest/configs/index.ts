// Re-export all vitest configurations
export * from './database';
export * from './next';
export * from './node';
export * from './react';

// Export base configuration utilities
export * from './base-config';

// Re-export createBaseConfig for backward compatibility
export { createBaseConfig } from './base-config';

// Export config builders
export * from './builders';

// Export Vite utilities
export * from './vite-utils';

// Export presets (TypeScript version) - excluding qstashPreset to avoid conflict
export {
  createPreset,
  databasePreset,
  integrationPreset,
  nextPreset,
  nodePreset,
  reactPreset,
} from './presets';

// Export qstash preset from its own file
export { qstashPreset } from './qstash';

// Export optimized coverage configuration
export * from './coverage-optimized';
