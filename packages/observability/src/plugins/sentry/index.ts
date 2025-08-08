/**
 * Sentry plugin exports
 * Provides full access to @sentry/nextjs while wrapping in plugin interface
 */

// Re-export everything from @sentry/nextjs for full Next.js access
export * from '@sentry/nextjs';

// Export plugin and factory
export { SentryPlugin, createSentryPlugin } from './plugin';
export type { SentryPluginConfig } from './plugin';

// Re-export Sentry environment configuration
export { env, safeEnv } from './env';
export type { Env } from './env';

// Export types
export type { ObservabilityPlugin, ObservabilityServerPlugin } from '../../core/plugin';
export type {
  Hub,
  Scope,
  Span,
  SpanContext,
  SpanStatus,
  Transaction,
  TransactionContext,
} from './types';
