/**
 * Server-side Next.js observability exports
 * Complete Next.js 15 integration for server components and API routes
 * 
 * @example
 * ```typescript
 * import { createNextJSServerObservability } from '@repo/observability-new/server/next';
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
  // Next.js server observability manager
  NextJSServerObservabilityManager,
  createNextJSServerObservability
} from './next/server';

export {
  // Next.js config wrappers (same for client and server)
  withSentry,
  withLogging,
  withObservability,
  createObservabilityConfig,
  type SentryBuildOptions
} from './next/config-wrappers';

// ============================================================================
// NEXT.JS TYPES
// ============================================================================

export type {
  NextJSServerObservabilityConfig
} from './next/server';