/**
 * Better Stack (Logtail) plugin exports
 */

// Export plugin and factory
export { BetterStackPlugin, createBetterStackPlugin } from './plugin';
export type { BetterStackPluginConfig } from './plugin';

// Re-export Better Stack environment configuration
export { env, safeEnv } from './env';
export type { Env } from './env';

// Export types
export type { ObservabilityPlugin, ObservabilityServerPlugin } from '../../core/plugin';
