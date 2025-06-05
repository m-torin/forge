/**
 * Client-side Next.js observability exports
 * Complete Next.js 15 integration for client components and browser environments
 *
 * @example
 * ```typescript
 * import { createNextJSClientObservability } from '@repo/observability/client/next';
 *
 * // Create Next.js optimized observability
 * const observability = createNextJSClientObservability({
 *   providers: { sentry: { dsn: 'xxx' } },
 *   nextjs: { tunnelRoute: '/monitoring-tunnel' }
 * });
 * ```
 */

// ============================================================================
// CORE CLIENT OBSERVABILITY (re-export everything from client)
// ============================================================================

// Re-export everything from client for convenience
export * from './client';

// ============================================================================
// NEXT.JS CLIENT INTEGRATION
// ============================================================================

export {
  createNextJSClientObservability,
  // Next.js client observability manager
  NextJSClientObservabilityManager,
} from './next/client';

export {
  createObservabilityConfig,
  type SentryBuildOptions,
  withLogging,
  withObservability,
  // Next.js config wrappers
  withSentry,
} from './next/config-wrappers';

// ============================================================================
// NEXT.JS TYPES
// ============================================================================

export type { NextJSClientObservabilityConfig } from './next/client';
