/**
 * Analytics Logger (Environment-Aware)
 *
 * This file provides a unified logger interface that works in all environments.
 * To maintain compatibility with the four-file export pattern, it uses only
 * client-safe console methods and avoids any server dependencies.
 *
 * Server-specific logging with observability should be done through the
 * server-specific analytics managers which can inject their own loggers.
 *
 * @example
 * ```typescript
 * import { analyticsLogger } from './utils/logger';
 *
 * await analyticsLogger.logError(error, {
 *   operation: 'track',
 *   provider: 'posthog',
 *   event: 'user_signup'
 * });
 * ```
 */

// Use the client logger implementation which is safe for all environments
// This avoids importing server-only dependencies in client bundles
export { analyticsLogger, AnalyticsLogger } from './logger-client';
export type { AnalyticsLogContext } from './logger-client';
