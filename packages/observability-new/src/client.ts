/**
 * Client-side observability exports
 * Complete observability solution for browser/client environments
 * 
 * @example
 * ```typescript
 * import { createClientObservability } from '@repo/observability-new/client';
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
import type { ObservabilityConfig, ProviderRegistry, ObservabilityManager } from './shared/types/types';

// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  sentry: () => new SentryClientProvider(),
  logtail: () => new LogtailProvider(),
  console: () => new ConsoleProvider()
};

// ============================================================================
// CORE OBSERVABILITY FUNCTIONS
// ============================================================================

/**
 * Create and initialize a client observability instance
 * This is the primary way to create observability for client-side applications
 */
export async function createClientObservability(config: ObservabilityConfig): Promise<ObservabilityManager> {
  const manager = createObservabilityManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a client observability instance without initializing
 * Useful when you need to control initialization timing
 */
export function createClientObservabilityUninitialized(config: ObservabilityConfig): ObservabilityManager {
  return createObservabilityManager(config, CLIENT_PROVIDERS);
}

// ============================================================================
// TYPES
// ============================================================================

// Core observability types
export type { 
  ObservabilityConfig, 
  ObservabilityProviderConfig,
  ObservabilityProvider as ObservabilityProviderInterface,
  ObservabilityContext as ObservabilityContextType,
  ObservabilityManager,
  Breadcrumb
} from './shared/types/types';

// Provider-specific types
export type {
  SentryConfig,
  SentryOptions,
  SentryUser
} from './shared/types/sentry-types';

export type {
  ConsoleConfig,
  ConsoleOptions
} from './shared/types/console-types';

export type {
  LogtailConfig,
  LogtailOptions
} from './shared/types/logtail-types';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export { 
  validateConfig,
  debugConfig 
} from './shared/utils/validation';

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export {
  parseError,
  parseAndCaptureError,
  createErrorBoundaryHandler,
  withErrorHandling,
  createSafeFunction
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
  // Hooks
  useObservability,
  useObservabilityManager,
  useWorkflowObservability,
  usePerformanceTimer,
  
  // Provider
  ObservabilityProvider,
  withObservability,
  ObservabilityContext,
  
  // Types
  type ObservabilityEvent,
  type ErrorContext,
  type ObservabilityProviderProps
} from './hooks';