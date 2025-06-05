/**
 * Server-side observability exports
 * Complete observability solution for server/Node.js environments
 * 
 * @example
 * ```typescript
 * import { createServerObservability } from '@repo/observability-new/server';
 * 
 * const observability = await createServerObservability({
 *   providers: {
 *     sentry: { dsn: 'xxx' },
 *     pino: { level: 'info' },
 *     opentelemetry: { serviceName: 'api' }
 *   }
 * });
 * 
 * // Use observability
 * observability.captureException(new Error('Server error'));
 * observability.log('info', 'Request received', { path: '/api/users' });
 * const transaction = observability.startTransaction('api_request');
 * ```
 */

import { SentryServerProvider } from './server/providers/sentry-server';
import { PinoProvider } from './server/providers/pino-provider';
import { WinstonProvider } from './server/providers/winston-provider';
import { OpenTelemetryProvider } from './server/providers/opentelemetry-provider';
import { ConsoleProvider } from './shared/providers/console-provider';
import { LogtailProvider } from './shared/providers/logtail-provider';
import { createObservabilityManager } from './shared/utils/manager';
import type { ObservabilityConfig, ProviderRegistry, ObservabilityManager } from './shared/types/types';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  sentry: () => new SentryServerProvider(),
  logtail: () => new LogtailProvider(),
  pino: () => new PinoProvider(),
  winston: () => new WinstonProvider(),
  opentelemetry: () => new OpenTelemetryProvider(),
  console: () => new ConsoleProvider()
};

// ============================================================================
// CORE OBSERVABILITY FUNCTIONS
// ============================================================================

/**
 * Create and initialize a server observability instance
 * This is the primary way to create observability for server-side applications
 */
export async function createServerObservability(config: ObservabilityConfig): Promise<ObservabilityManager> {
  const manager = createObservabilityManager(config, SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a server observability instance without initializing
 * Useful when you need to control initialization timing
 */
export function createServerObservabilityUninitialized(config: ObservabilityConfig): ObservabilityManager {
  return createObservabilityManager(config, SERVER_PROVIDERS);
}

// ============================================================================
// TYPES
// ============================================================================

// Core observability types
export type { 
  ObservabilityConfig, 
  ObservabilityProviderConfig,
  ObservabilityProvider,
  ObservabilityContext,
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
  OpenTelemetryConfig,
  OpenTelemetryOptions
} from './shared/types/opentelemetry-types';

export type {
  LoggerConfig,
  LoggerTransport,
  PinoConfig,
  WinstonConfig,
  LogEntry
} from './shared/types/logger-types';

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