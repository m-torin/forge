/**
 * Server-side Next.js observability exports
 * Complete Next.js 15 integration for server components, API routes, and middleware
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
 * });
 * ```
 */

// Import minimal providers for Next.js - focus on working providers only
import { SentryServerProvider } from './server/providers/sentry-server';
import { ConsoleProvider } from './shared/providers/console-provider';
import { createObservabilityManager } from './shared/utils/manager';

import type {
  ObservabilityConfig,
  ObservabilityManager,
  ProviderRegistry,
} from './shared/types/types';

// ============================================================================
// NEXT.JS-SPECIFIC PROVIDER REGISTRY
// ============================================================================

// Next.js-specific provider registry - minimal working providers
const NEXTJS_SERVER_PROVIDERS: ProviderRegistry = {
  console: () => new ConsoleProvider(),
  sentry: () => new SentryServerProvider(),
  // TODO: Add LogtailNextProvider once bundling issues are resolved
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
  const manager = createObservabilityManager(config, NEXTJS_SERVER_PROVIDERS);
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
  return createObservabilityManager(config, NEXTJS_SERVER_PROVIDERS);
}

// ============================================================================
// RE-EXPORT TYPES AND UTILITIES (avoid importing providers)
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

// Provider-specific types
export type { SentryConfig, SentryOptions, SentryUser } from './shared/types/sentry-types';
export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';
// TODO: Re-export Logtail types once provider is working
// export type { LogtailConfig, LogtailOptions } from './shared/types/logtail-types';

// Configuration utilities
export { debugConfig, validateConfig } from './shared/utils/validation';

// Error handling utilities
export {
  createErrorBoundaryHandler,
  createSafeFunction,
  parseAndCaptureError,
  parseError,
} from './shared/utils/error';

// ============================================================================
// NEXT.JS SERVER INSTRUMENTATION
// ============================================================================

export { onRequestError, register } from './next/instrumentation';

// ============================================================================
// NEXT.JS CONFIG WRAPPERS
// ============================================================================

export {
  createObservabilityConfig,
  type SentryBuildOptions,
  withLogging,
  withObservability,
  withSentry,
} from './next/config-wrappers';

// ============================================================================
// NEXT.JS SERVER CONFIGURATION
// ============================================================================

export { getObservabilityConfig, mergeObservabilityConfig } from './next/config';
