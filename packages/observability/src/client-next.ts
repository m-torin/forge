/**
 * Client-side Next.js observability exports
 * Complete Next.js 15 integration for client components and browser environments
 *
 * @example
 * ```typescript
 * import {
 *   createClientObservability,
 *   ObservabilityProvider,
 *   useObservability,
 *   initializeClient
 * } from '@repo/observability/client/next';
 *
 * // In your layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <ObservabilityProvider config={{
 *       providers: {
 *         sentry: { dsn: process.env.NEXT_PUBLIC_SENTRY_DSN }
 *       }
 *     }}>
 *       {children}
 *     </ObservabilityProvider>
 *   );
 * }
 * ```
 */

// ============================================================================
// CORE CLIENT OBSERVABILITY (re-export everything from client)
// ============================================================================

export * from './client';

// ============================================================================
// NEXT.JS CLIENT COMPONENTS & HOOKS
// ============================================================================

export {
  type ErrorContext,
  ObservabilityContext,

  // Types
  type ObservabilityEvent,
  // Context providers
  ObservabilityProvider,
  type ObservabilityProviderProps,
  // React hooks for client components
  useObservability,

  useObservabilityManager,

  usePerformanceTimer,
  useWorkflowObservability,
  // HOCs
  withObservability,
} from './hooks';

// ============================================================================
// NEXT.JS CLIENT INSTRUMENTATION
// ============================================================================

export {
  initializeClient,
  default as initializeClientDefault,
  onRouterTransitionStart,
} from './next/instrumentation-client';

// ============================================================================
// NEXT.JS CLIENT CONFIGURATION
// ============================================================================

export { getObservabilityConfig, mergeObservabilityConfig } from './next/config';
