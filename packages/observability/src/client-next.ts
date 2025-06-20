/**
 * Client-side observability exports for Next.js
 * Complete Next.js 15 integration for client components and browser environments
 *
 * This file provides client-side observability functionality specifically for Next.js applications.
 * Use this in client components, React hooks, and Next.js browser environments.
 *
 * For non-Next.js applications, use '@repo/observability/client' instead.
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
// CORE CLIENT OBSERVABILITY (Next.js-specific implementation)
// ============================================================================

import { createClientObservabilityManager } from './client/utils/manager';
import { ObservabilityConfig, ObservabilityManager, ProviderRegistry } from './shared/types/types';

// Next.js client-specific provider registry with lazy loading
const NEXTJS_CLIENT_PROVIDERS: ProviderRegistry = {
  console: async () => {
    const { ConsoleProvider } = await import('./shared/providers/console-provider');
    return new ConsoleProvider();
  },
  sentry: async () => {
    const { SentryClientProvider } = await import('./client/providers/sentry-client');
    return new SentryClientProvider();
  },
  grafanaMonitoring: async () => {
    const { GrafanaClientProvider } = await import('./client/providers/grafana-client');
    return new GrafanaClientProvider();
  },
  logtail: async () => {
    const { LogtailClientNextProvider } = await import('./client/providers/logtail-client-next');
    return new LogtailClientNextProvider();
  },
};

/**
 * Create and initialize a Next.js client observability instance
 * This is the primary way to create observability for Next.js client components
 */
export async function createClientObservability(
  config: ObservabilityConfig,
): Promise<ObservabilityManager> {
  const manager = createClientObservabilityManager(config, NEXTJS_CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a Next.js client observability instance without initializing
 * Useful when you need to control initialization timing
 */
export function createClientObservabilityUninitialized(
  config: ObservabilityConfig,
): ObservabilityManager {
  return createClientObservabilityManager(config, NEXTJS_CLIENT_PROVIDERS);
}

// Error handling utilities
export {
  createErrorBoundaryHandler,
  createSafeFunction,
  parseAndCaptureError,
  parseError,
  withErrorHandling,
} from './client/utils/error';

// Manager utilities
export { createClientObservabilityManager } from './client/utils/manager';
export { ClientObservabilityManager as ObservabilityManagerClass } from './client/utils/manager';

// Configuration utilities
export { debugConfig, validateConfig } from './client/utils/validation';

// Re-export types only (no runtime code)
export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';

export type { SentryConfig, SentryOptions, SentryUser } from './shared/types/sentry-types';

export type {
  GrafanaMonitoringConfig,
  GrafanaProviderConfig,
  GrafanaRUMEvent,
  GrafanaMetric,
  GrafanaBusinessMetric,
} from './shared/types/grafana-types';

export type {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityContext as ObservabilityContextType,
  ObservabilityManager,
  ObservabilityProviderConfig,
  ObservabilityProvider as ObservabilityProviderInterface,
} from './shared/types/types';

// ============================================================================
// NEXT.JS CLIENT COMPONENTS & HOOKS (React 19 Enhanced)
// ============================================================================

export {
  // Types
  type ErrorContext,
  // Context and providers
  ObservabilityContext,
  // React 19 Error Boundary
  ObservabilityErrorBoundary,
  type ObservabilityEvent,
  ObservabilityProvider,
  type ObservabilityProviderProps,
  // React hooks for client components
  useObservability,
  useObservabilityManager,
  usePerformanceTimer,
  useWorkflowObservability,
  // HOCs
  withObservability,
  withObservabilityErrorBoundary,
} from './hooks';

// ============================================================================
// NEXT.JS CLIENT INSTRUMENTATION
// ============================================================================

export { getObservabilityConfig, mergeObservabilityConfig } from './next/config';

// ============================================================================
// NEXT.JS CLIENT INITIALIZATION
// ============================================================================

/**
 * Initialize client-side observability for Next.js
 * This should be called from instrumentation-client.ts
 *
 * @example
 * ```typescript
 * // instrumentation-client.ts
 * import { initializeClient } from '@repo/observability/client/next';
 *
 * initializeClient({
 *   providers: {
 *     sentry: {
 *       dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
 *       browserTracingEnabled: true,
 *       replayEnabled: true,
 *       feedbackEnabled: true,
 *     }
 *   }
 * });
 * ```
 */
export async function initializeClient(config?: ObservabilityConfig): Promise<void> {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const manager = createClientObservabilityManager(
      config || getDefaultClientConfig(),
      NEXTJS_CLIENT_PROVIDERS,
    );
    await manager.initialize();

    // Store manager globally for access by hooks
    if (typeof window !== 'undefined') {
      (window as any).__observabilityManager = manager;
    }
  } catch (error) {
    console.error('[Observability] Failed to initialize client:', error);
  }
}

/**
 * Get default client configuration
 * Used when no config is provided to initializeClient
 */
function getDefaultClientConfig(): ObservabilityConfig {
  const hasSentryDSN = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

  return {
    providers: {
      console: {
        enabled: process.env.NODE_ENV === 'development',
      },
      ...(hasSentryDSN && {
        sentry: {
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
          replaysOnErrorSampleRate: 1.0,
        },
      }),
    },
  };
}

// ============================================================================
// NEXT.JS CLIENT CONFIGURATION
// ============================================================================

export {
  initializeClient as initializeClientLegacy,
  default as initializeClientDefault,
  onRouterTransitionStart,
} from './next/instrumentation-client';

// ============================================================================
// NEXT.JS CLIENT BUNDLE OPTIMIZATION
// ============================================================================

// Export bundle optimization utilities specifically for Next.js client
export {
  analyzeBundleSize,
  clearProviderCache,
  createLazyProviderLoader,
  preloadProviders,
} from './shared/utils/lazy-loading';
