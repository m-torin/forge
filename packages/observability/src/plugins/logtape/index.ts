/**
 * LogTape plugin exports
 * LogTape is a modern, zero-dependency logging library for TypeScript
 */

// Re-export everything from @logtape/logtape for full access
export * from '@logtape/logtape';

// Export plugin and factory
export { LogTapePlugin, createLogTapePlugin } from './plugin';
export type { LogTapePluginConfig } from './plugin';

// Re-export LogTape environment configuration
export { env, safeEnv } from './env';
export type { Env } from './env';

// Export types
export type { ObservabilityPlugin, ObservabilityServerPlugin } from '../../core/plugin';
