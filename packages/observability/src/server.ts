/**
 * Server-side observability exports (non-Next.js)
 * Complete observability solution for server/Node.js environments
 *
 * This file provides server-side observability functionality for non-Next.js applications.
 * Use this in Node.js applications, API servers, and standalone server environments.
 *
 * For Next.js applications, use '@repo/observability/server/next' instead.
 *
 * @example
 * ```typescript
 * import { createServerObservability } from '@repo/observability/server';
 *
 * const observability = await createServerObservability({
 *   providers: {
 *     sentry: { dsn: 'xxx' },
 *     'vercel-otel': { serviceName: 'api' },
 *     console: { enabled: process.env.NODE_ENV === 'development' }
 *   }
 * };
 *
 * // Use observability
 * observability.captureException(new Error('Server error'));
 * observability.log('info', 'Request received', { path: '/api/users' });
 * const transaction = observability.startTransaction('api_request');
 * ```
 */

import { createServerObservabilityManager } from './server/utils/manager';
import { ObservabilityConfig, ObservabilityManager, ProviderRegistry } from './shared/types/types';

// Server-specific provider registry with lazy loading for all providers
const SERVER_PROVIDERS: ProviderRegistry = {
  console: async () => {
    const { ConsoleProvider } = await import('./shared/providers/console-provider');
    return new ConsoleProvider();
  },
  opentelemetry: async () => {
    const { VercelOTelProvider } = await import('./server/providers/nodejs/vercel-otel-provider');
    return new VercelOTelProvider();
  },
  otel: async () => {
    const { VercelOTelProvider } = await import('./server/providers/nodejs/vercel-otel-provider');
    return new VercelOTelProvider();
  },
  sentry: async () => {
    const { SentryServerProvider } = await import('./server/providers/sentry-server');
    return new SentryServerProvider();
  },
  // Lazy-load OpenTelemetry provider to avoid bundling when not used
  'vercel-otel': async () => {
    const { VercelOTelProvider } = await import('./server/providers/nodejs/vercel-otel-provider');
    return new VercelOTelProvider();
  },
  grafanaMonitoring: async () => {
    const { GrafanaServerProvider } = await import('./server/providers/grafana-server');
    return new GrafanaServerProvider();
  },
  logtail: async () => {
    const { LogtailServerProvider } = await import('./server/providers/logtail-server');
    return new LogtailServerProvider();
  },
};

// ============================================================================
// CORE OBSERVABILITY FUNCTIONS
// ============================================================================

/**
 * Create and initialize a server observability instance
 * This is the primary way to create observability for server-side applications
 */
export async function createServerObservability(
  config: ObservabilityConfig,
): Promise<ObservabilityManager> {
  const manager = createServerObservabilityManager(config, SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a server observability instance without initializing
 * Useful when you need to control initialization timing
 */
export function createServerObservabilityUninitialized(
  config: ObservabilityConfig,
): ObservabilityManager {
  return createServerObservabilityManager(config, SERVER_PROVIDERS);
}

// ============================================================================
// TYPES
// ============================================================================

export {
  createErrorBoundaryHandler,
  createSafeFunction,
  parseAndCaptureError,
  parseError,
  withErrorHandling,
} from './server/utils/error';

// Manager utilities
export {
  createServerObservabilityManager,
  ServerObservabilityManager as ObservabilityManagerClass,
} from './server/utils/manager';
export { debugConfig, validateConfig } from './server/utils/validation';
export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';

// New simplified logger functions (recommended)
export { configureLogger, logDebug, logError, logInfo, logWarn } from './logger-functions';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

// TODO: Re-enable Better Stack types once bundling issues are resolved
// export type { BetterStackConfig, BetterStackOptions, BetterStackMetrics, BetterStackTrace, BetterStackSpan, BetterStackEvent } from './shared/types/better-stack-types';
// Legacy Logtail types for backward compatibility
export type { LogtailConfig, LogtailOptions } from './shared/types/logtail-types';

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export type {
  OpenTelemetryConfig,
  OpenTelemetryOptions,
  VercelOTelConfig,
} from './shared/types/opentelemetry-types';

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Provider-specific types
export type {
  GrafanaBusinessMetric,
  GrafanaHealthCheck,
  GrafanaLogEntry,
  GrafanaMetric,
  GrafanaMonitoringConfig,
  GrafanaProviderConfig,
  GrafanaTrace,
} from './shared/types/grafana-types';
export type { SentryConfig, SentryOptions, SentryUser } from './shared/types/sentry-types';
// Core observability types
export type {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityManager,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from './shared/types/types';
