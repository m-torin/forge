/**
 * Server-side Next.js observability exports
 * Complete Next.js 15 integration for server components and API routes
 *
 * @example
 * ```typescript
 * import { createNextJSServerObservability } from '@repo/observability/server/next';
 *
 * // Create Next.js server observability
 * const observability = createNextJSServerObservability({
 *   providers: {
 *     sentry: { dsn: process.env.SENTRY_DSN },
 *     pino: { level: 'info' }
 *   }
 * });
 * ```
 */

// ============================================================================
// CORE SERVER OBSERVABILITY (re-export everything from server)
// ============================================================================

// Re-export everything from server for convenience
export * from './server';

// ============================================================================
// NEXT.JS SERVER INTEGRATION
// ============================================================================

export {
  createNextJSServerObservability,
  // Next.js server observability manager
  NextJSServerObservabilityManager,
} from './next/server';

export {
  createObservabilityConfig,
  type SentryBuildOptions,
  withLogging,
  withObservability,
  // Next.js config wrappers (same for client and server)
  withSentry,
} from './next/config-wrappers';

// ============================================================================
// NEXT.JS TYPES
// ============================================================================

export type { NextJSServerObservabilityConfig } from './next/server';
