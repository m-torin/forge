/**
 * Client-side observability exports (non-Next.js)
 * Complete observability solution for browser/client environments
 *
 * This file provides client-side observability functionality for non-Next.js applications.
 * Use this in browser environments, client-side applications, and standalone JavaScript.
 *
 * For Next.js applications, use '@repo/observability/client/next' instead.
 *
 * @example
 * ```typescript
 * import { createClientObservability } from '@repo/observability/client';
 *
 * const observability = await createClientObservability({
 *   providers: {
 *     sentry: { dsn: 'xxx' },
 *     console: { enabled: true }
 *   }
 * };
 *
 * // Use observability
 * observability.captureException(new Error('Something went wrong'));
 * observability.log('info', 'User action', { userId: '123' });
 * ```
 */

import { createClientObservabilityManager } from './client/utils/manager';
import { ObservabilityConfig, ObservabilityManager, ProviderRegistry } from './shared/types/types';

// Client-specific provider registry with lazy loading
const CLIENT_PROVIDERS: ProviderRegistry = {
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
    const { LogtailClientProvider } = await import('./client/providers/logtail-client');
    return new LogtailClientProvider();
  },
};

// ============================================================================
// CORE OBSERVABILITY FUNCTIONS
// ============================================================================

/**
 * Create and initialize a client observability instance
 * This is the primary way to create observability for client-side applications
 */
export async function createClientObservability(
  config: ObservabilityConfig,
): Promise<ObservabilityManager> {
  const manager = createClientObservabilityManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a client observability instance without initializing
 * Useful when you need to control initialization timing
 */
export function createClientObservabilityUninitialized(
  config: ObservabilityConfig,
): ObservabilityManager {
  return createClientObservabilityManager(config, CLIENT_PROVIDERS);
}

// ============================================================================
// TYPES (Client-safe only - no React dependencies)
// ============================================================================

// Pure types only - React components and hooks are in client-next.ts

export {
  createErrorBoundaryHandler,
  createSafeFunction,
  parseAndCaptureError,
  parseError,
  withErrorHandling,
} from './client/utils/error';
// Manager utilities
export { createClientObservabilityManager } from './client/utils/manager';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export { ClientObservabilityManager as ObservabilityManagerClass } from './client/utils/manager';

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export { debugConfig, validateConfig } from './client/utils/validation';

// ============================================================================
// BUNDLE OPTIMIZATION & LAZY LOADING
// ============================================================================

export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Provider-specific types
export type {
  GrafanaBusinessMetric,
  GrafanaMetric,
  GrafanaMonitoringConfig,
  GrafanaProviderConfig,
  GrafanaRUMEvent,
} from './shared/types/grafana-types';
export type { SentryConfig, SentryOptions, SentryUser } from './shared/types/sentry-types';
// Core observability types
export type {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityContext as ObservabilityContextType,
  ObservabilityManager,
  ObservabilityProviderConfig,
  ObservabilityProvider as ObservabilityProviderInterface,
} from './shared/types/types';

// ============================================================================
// REACT HOOKS & COMPONENTS
// ============================================================================

export {
  analyzeBundleSize,
  clearProviderCache,
  createLazyProviderLoader,
  preloadProviders,
} from './shared/utils/lazy-loading';

// ============================================================================
// UNIVERSAL LOGGER FUNCTIONS
// ============================================================================

export { configureLogger, logDebug, logError, logInfo, logWarn } from './logger-functions';
export type { LogContext } from './logger-functions';
