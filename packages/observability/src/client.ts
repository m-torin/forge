/**
 * Client-side observability exports
 * Complete observability solution for browser/client environments
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
 * });
 *
 * // Use observability
 * observability.captureException(new Error('Something went wrong'));
 * observability.log('info', 'User action', { userId: '123' });
 * ```
 */

import { SentryClientProvider } from './client/providers/sentry-client';
import { ConsoleProvider } from './shared/providers/console-provider';
import { LogtailProvider } from './shared/providers/logtail-provider';
import { createObservabilityManager } from './shared/utils/manager';

import type {
  ObservabilityConfig,
  ObservabilityManager,
  ProviderRegistry,
} from './shared/types/types';

// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  console: () => new ConsoleProvider(),
  logtail: () => new LogtailProvider(),
  sentry: () => new SentryClientProvider(),
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
  const manager = createObservabilityManager(config, CLIENT_PROVIDERS);
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
  return createObservabilityManager(config, CLIENT_PROVIDERS);
}

// ============================================================================
// TYPES
// ============================================================================

// Core observability types
export type {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityContext as ObservabilityContextType,
  ObservabilityManager,
  ObservabilityProviderConfig,
  ObservabilityProvider as ObservabilityProviderInterface,
} from './shared/types/types';

// Provider-specific types
export type { SentryConfig, SentryOptions, SentryUser } from './shared/types/sentry-types';

export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';

export type { LogtailConfig, LogtailOptions } from './shared/types/logtail-types';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export { debugConfig, validateConfig } from './shared/utils/validation';

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export {
  createErrorBoundaryHandler,
  createSafeFunction,
  parseAndCaptureError,
  parseError,
  withErrorHandling,
} from './shared/utils/error';

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Manager utilities
export { createObservabilityManager } from './shared/utils/manager';
export { ObservabilityManager as ObservabilityManagerClass } from './shared/utils/manager';

// ============================================================================
// REACT HOOKS & COMPONENTS
// ============================================================================

export {
  type ErrorContext,
  ObservabilityContext,
  // Types
  type ObservabilityEvent,
  // Provider
  ObservabilityProvider,
  type ObservabilityProviderProps,
  // Hooks
  useObservability,
  useObservabilityManager,
  usePerformanceTimer,
  useWorkflowObservability,
  withObservability,
} from './hooks';
