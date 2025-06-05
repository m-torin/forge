/**
 * Client-side Next.js observability exports
 * Complete Next.js 15 integration for client components and browser environments
 * 
 * @example
 * ```typescript
 * import { createNextJSClientObservability } from '@repo/observability-new/client/next';
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
  // Next.js client observability manager
  NextJSClientObservabilityManager,
  createNextJSClientObservability
} from './next/client';

export {
  // Next.js config wrappers
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
  NextJSClientObservabilityConfig
} from './next/client';