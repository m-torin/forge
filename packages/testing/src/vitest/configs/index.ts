/**
 * Configuration utilities for various testing frameworks
 *
 * Note: The base configuration is not exported directly.
 * Users should use one of the framework-specific configurations.
 */

// Export framework-specific configurations
export { createReactConfig } from './react.ts';
export { createMantineConfig } from './mantine.ts';
export { createServerConfig } from './server.ts';

// Do not export base configuration
// export * from './base.ts';
