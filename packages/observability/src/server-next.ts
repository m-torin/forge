/**
 * Server-side observability exports for Next.js
 * Complete Next.js 15 integration for server components, API routes, and middleware
 *
 * This file provides server-side observability functionality specifically for Next.js applications.
 * Use this in server components, API routes, middleware, and Next.js instrumentation.
 *
 * For non-Next.js applications, use '@repo/observability/server' instead.
 *
 * @example
 * ```typescript
 * import {
 *   createServerObservability,
 *   register,
 *   withObservability
 * } from '@repo/observability/server/next';
 *
 * // In your instrumentation.ts
 * export { register, onRequestError } from '@repo/observability/server/next';
 *
 * // In your next.config.ts
 * export default withObservability(nextConfig, {
 *   sentry: { org: 'my-org', project: 'my-project' }
 * };
 * ```
 */

// Import only the manager and types - providers are lazy loaded
import { createServerObservabilityManager } from './server/utils/manager';
import { ObservabilityConfig, ObservabilityManager, ProviderRegistry } from './shared/types/types';

// ============================================================================
// NEXT.JS-SPECIFIC PROVIDER REGISTRY
// ============================================================================

// Next.js-specific provider registry with smart runtime detection
const NEXTJS_SERVER_PROVIDERS: ProviderRegistry = {
  console: async () => {
    const { ConsoleProvider } = await import('./shared/providers/console-provider');
    return new ConsoleProvider();
  },
  // OpenTelemetry providers with edge runtime detection
  opentelemetry: async () => {
    // Only load in Node.js runtime, not Edge runtime
    if (process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('OpenTelemetry not supported in Edge runtime');
    }
    const { VercelOTelProvider } = await import('./server/providers/vercel-otel-provider');
    return new VercelOTelProvider();
  },
  otel: async () => {
    // Only load in Node.js runtime, not Edge runtime
    if (process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('OpenTelemetry not supported in Edge runtime');
    }
    const { VercelOTelProvider } = await import('./server/providers/vercel-otel-provider');
    return new VercelOTelProvider();
  },
  sentry: async () => {
    const { SentryServerProvider } = await import('./server/providers/sentry-server');
    return new SentryServerProvider();
  },
  // Edge-compatible Sentry provider (no OpenTelemetry dependencies)
  'sentry-edge': async () => {
    const { SentryEdgeProvider } = await import('./server/providers/sentry-edge');
    return new SentryEdgeProvider();
  },
  // Vercel OpenTelemetry provider with runtime detection
  'vercel-otel': async () => {
    // Only load in Node.js runtime, not Edge runtime
    if (process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('Vercel OpenTelemetry not supported in Edge runtime');
    }
    const { VercelOTelProvider } = await import('./server/providers/vercel-otel-provider');
    return new VercelOTelProvider();
  },
  // Logtail provider (Next.js server-side)
  logtail: async () => {
    const { LogtailServerNextProvider } = await import('./server/providers/logtail-server-next');
    return new LogtailServerNextProvider();
  },
  grafanaMonitoring: async () => {
    // Grafana monitoring works in both Edge and Node.js runtime
    const { GrafanaServerProvider } = await import('./server/providers/grafana-server');
    return new GrafanaServerProvider();
  },
};

// ============================================================================
// NEXT.JS SERVER OBSERVABILITY FUNCTIONS
// ============================================================================

/**
 * Create and initialize a Next.js server observability instance
 * This overrides the standard server version to use Next.js-specific providers
 */
export async function createServerObservability(
  config: ObservabilityConfig,
): Promise<ObservabilityManager> {
  const manager = createServerObservabilityManager(config, NEXTJS_SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a Next.js server observability instance without initializing
 * Useful when you need to control initialization timing
 */
export function createServerObservabilityUninitialized(
  config: ObservabilityConfig,
): ObservabilityManager {
  return createServerObservabilityManager(config, NEXTJS_SERVER_PROVIDERS);
}

// ============================================================================
// RE-EXPORT TYPES AND UTILITIES (avoid importing providers)
// ============================================================================

export { getObservabilityConfig, mergeObservabilityConfig } from './next/config';

export {
  createObservabilityConfig,
  type SentryBuildOptions,
  // type VercelOTelBuildOptions, // Disabled to prevent OpenTelemetry bundling
  withLogging,
  withObservability,
  withSentry,
  // withVercelOTel, // Disabled to prevent OpenTelemetry bundling
} from './next/config-wrappers';
// Export instrumentation functions separately to avoid circular dependency
export { onRequestError } from './next/instrumentation';
export { register } from './next/instrumentation';
// OpenTelemetry instrumentation helpers (Node.js runtime only)
export { getDefaultOTelConfig, registerOTel, simpleOTelSetup } from './next/otel-instrumentation';

// Logtail types for backward compatibility
export type { LogtailConfig, LogtailOptions } from './shared/types/logtail-types';

// Error handling utilities
export {
  createErrorBoundaryHandler,
  createSafeFunction,
  parseAndCaptureError,
  parseError,
} from './server/utils/error';

// OpenTelemetry types (only for Node.js runtime)
export type {
  OpenTelemetryConfig,
  OpenTelemetryOptions,
  VercelOTelConfig,
} from './shared/types/opentelemetry-types';

// ============================================================================
// NEXT.JS SERVER INSTRUMENTATION
// ============================================================================

// Configuration utilities
export { debugConfig, validateConfig } from './server/utils/validation';

export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';

// ============================================================================
// NEXT.JS CONFIG WRAPPERS
// ============================================================================

// Provider-specific types
export type { SentryConfig, SentryOptions, SentryUser } from './shared/types/sentry-types';
export type {
  GrafanaMonitoringConfig,
  GrafanaProviderConfig,
  GrafanaMetric,
  GrafanaBusinessMetric,
  GrafanaHealthCheck,
  GrafanaTrace,
  GrafanaLogEntry,
} from './shared/types/grafana-types';

// ============================================================================
// NEXT.JS SERVER CONFIGURATION
// ============================================================================

// Re-export types only
export type {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityManager,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from './shared/types/types';
