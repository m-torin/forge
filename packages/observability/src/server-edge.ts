/**
 * Edge runtime observability for Next.js
 * Edge-compatible implementation without Node.js APIs
 */

import { SentryEdgeProvider } from './server/providers/sentry-edge';
import {
  ObservabilityConfig,
  ObservabilityManager,
  ObservabilityProvider,
} from './shared/types/types';
import { Environment } from './shared/utils/environment';

/**
 * Edge-compatible observability manager
 * Uses lightweight providers compatible with edge runtime
 */
class EdgeObservabilityManager implements ObservabilityManager {
  private providers: Map<string, ObservabilityProvider> = new Map();
  private isInitialized = false;
  private config: ObservabilityConfig = { providers: {} };

  async initialize(): Promise<void> {
    return this.initializeWithConfig(this.config);
  }

  async initializeWithConfig(config: ObservabilityConfig): Promise<void> {
    this.config = config;
    if (this.isInitialized) {
      console.warn('[Observability Edge] Already initialized');
      return;
    }

    // Initialize Sentry Edge provider if configured
    if (config.providers?.sentry?.dsn) {
      const sentryProvider = new SentryEdgeProvider();
      await sentryProvider.initialize(config.providers.sentry);
      this.providers.set('sentry', sentryProvider);
    }

    // Add other edge-compatible providers here in the future
    // Note: OpenTelemetry is NOT compatible with edge runtime

    this.isInitialized = true;

    if (Environment.isDevelopment()) {
      console.info('[Observability Edge] Initialized with edge-compatible providers');
    }
  }

  getProvider(name: string): ObservabilityProvider | undefined {
    return this.providers.get(name);
  }

  async captureException(error: Error, context?: any): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        await provider.captureException(error, context);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning' = 'info',
    context?: any,
  ): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        await provider.captureMessage(message, level, context);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  addBreadcrumb(breadcrumb: any): void {
    for (const provider of this.providers.values()) {
      try {
        provider.addBreadcrumb?.(breadcrumb);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    for (const provider of this.providers.values()) {
      try {
        provider.setContext?.(key, context);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  setTag(key: string, value: string | number | boolean): void {
    for (const provider of this.providers.values()) {
      try {
        provider.setTag?.(key, value);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    for (const provider of this.providers.values()) {
      try {
        provider.setUser?.(user);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    for (const provider of this.providers.values()) {
      try {
        await provider.log?.(level, message, metadata);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  setExtra(key: string, value: any): void {
    for (const provider of this.providers.values()) {
      try {
        provider.setExtra?.(key, value);
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  startSession(): void {
    for (const provider of this.providers.values()) {
      try {
        provider.startSession?.();
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  endSession(): void {
    for (const provider of this.providers.values()) {
      try {
        provider.endSession?.();
      } catch (providerError) {
        throw new Error(`[Observability Edge] Provider error: ${providerError}`);
      }
    }
  }

  startSpan(name: string, parentSpan?: any): any {
    // Edge runtime doesn't support OpenTelemetry spans
    console.info(`[Observability Edge] Span created: ${name} (edge runtime, no actual span)`);
    return { name, parentSpan };
  }

  startTransaction(name: string, context?: any): any {
    // Edge runtime doesn't support OpenTelemetry transactions
    console.info(
      `[Observability Edge] Transaction created: ${name} (edge runtime, no actual transaction)`,
    );
    return { name, context };
  }
}

// Create singleton instance
const edgeObservabilityManager = new EdgeObservabilityManager();

/**
 * Initialize edge observability with console logging only
 * OTEL disabled to avoid native module conflicts in edge runtime
 */
export async function register(config?: ObservabilityConfig) {
  // Skip all OTEL initialization - just log errors to console
  console.info('[Observability Edge] OTEL disabled, using console logging only');

  // Initialize our edge observability manager
  await edgeObservabilityManager.initializeWithConfig(config || { providers: {} });
}

/**
 * Capture exceptions in edge runtime
 */
export async function captureException(error: Error, context?: any) {
  await edgeObservabilityManager.captureException(error, context);
}

/**
 * Capture messages in edge runtime
 */
export async function captureMessage(
  message: string,
  level: 'error' | 'info' | 'warning' = 'info',
  context?: any,
) {
  await edgeObservabilityManager.captureMessage(message, level, context);
}

/**
 * Add breadcrumb in edge runtime
 */
export function addBreadcrumb(breadcrumb: any) {
  edgeObservabilityManager.addBreadcrumb(breadcrumb);
}

/**
 * Set context in edge runtime
 */
export function setContext(key: string, context: Record<string, any>) {
  edgeObservabilityManager.setContext(key, context);
}

/**
 * Set tag in edge runtime
 */
export function setTag(key: string, value: string | number | boolean) {
  edgeObservabilityManager.setTag(key, value);
}

/**
 * Set user in edge runtime
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  edgeObservabilityManager.setUser(user);
}

/**
 * Log message in edge runtime
 */
export async function log(level: string, message: string, metadata?: any) {
  await edgeObservabilityManager.log(level, message, metadata);
}

/**
 * Get specific provider (for advanced usage)
 */
export function getProvider(name: string) {
  return edgeObservabilityManager.getProvider(name);
}

/**
 * Export the manager for advanced usage
 */
export { edgeObservabilityManager as observabilityManager };

/**
 * Export error handler for edge runtime middleware
 */
export async function onRequestError(error: Error, request?: Request) {
  await captureException(error, {
    extra: {
      url: request?.url,
      method: request?.method,
      headers: request ? Object.fromEntries(request.headers.entries()) : undefined,
    },
    tags: {
      runtime: 'edge',
      context: 'middleware',
    },
  });
}

// Export universal logger functions (they auto-detect edge runtime)
export {
  configureLogger,
  logDebug,
  logError,
  logInfo,
  logWarn,
  type LogContext,
} from './logger-functions';

// Keep edge-specific createLogger for backward compatibility
export { createLogger, type Logger } from './logger-functions-edge';
