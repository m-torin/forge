/**
 * Auto-configuring client export for browser environments (non-Next.js)
 */

import { env } from '../env';
import { ObservabilityBuilder } from './factory/builder';
import { createConsolePlugin } from './plugins/console';

/**
 * Auto-configured observability for browser environments
 * Automatically sets up console logging based on environment variables
 */
const builder = ObservabilityBuilder.create();

// Console logging control (browser uses NEXT_PUBLIC vars only)
const isDevelopment = env.NEXT_PUBLIC_NODE_ENV === 'development';
const enableConsole =
  env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED ?? // Explicit control
  isDevelopment ?? // Auto in dev
  env.NEXT_PUBLIC_OBSERVABILITY_DEBUG; // Debug mode

// Always add console plugin, control via enabled flag
builder.withPlugin(
  createConsolePlugin({
    prefix: '[Browser]',
    enabled: enableConsole,
  }),
);

// Note: Sentry and Better Stack would typically be configured by the app
// This is just a fallback for non-Next.js browser usage

/**
 * Pre-configured observability instance for browser environments
 * Includes console logging with automatic environment-based configuration
 */
export const observability = builder.build();

// Export types and utilities
export * from './core/types';
export { createObservability } from './factory';
export { ObservabilityBuilder } from './factory/builder';

/**
 * Logger functions exported from the observability instance
 * Use these instead of deprecated standalone functions
 * @example
 * ```typescript
 * import { logInfo, logError } from '@repo/observability/client';
 * logInfo('User logged in', { userId: '123' });
 * logError('Failed to save data', { error: err });
 * ```
 */
export const { logDebug, logInfo, logWarn, logError } = observability;

// Legacy function for backward compatibility (no-op)
/**
 * @deprecated Configuration now happens through the observability system
 */
export const configureLogger = (_config?: any) => {
  // No-op: Configuration now happens through the observability system
};

// Re-export type
export type LogContext = Record<string, any>;
