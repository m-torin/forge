/**
 * Observability Manager - Core orchestration for multi-provider observability
 */

import {
  Breadcrumb,
  ObservabilityManager as IObservabilityManager,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityProvider,
  ProviderRegistry,
} from '../types/types';

import { CircuitBreaker, createCircuitBreaker } from './circuit-breaker';
import { mergeObservabilityContext } from './config';
import { ConnectionPool } from './connection-pool';
import { ProviderHealthMonitor, createHealthMonitor } from './health-check';
import { createTimeoutConfig, withTimeout } from './timeout';

export class ObservabilityManager implements IObservabilityManager {
  private context: ObservabilityContext = {};
  private contexts: Record<string, Record<string, any>> = {};
  private extras: Record<string, any> = {};
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private providers = new Map<string, ObservabilityProvider>();
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private tags: Record<string, boolean | number | string> = {};
  private user: null | { [key: string]: any; email?: string; id: string; username?: string } = null;
  private timeouts = createTimeoutConfig();
  private healthMonitor: ProviderHealthMonitor | null = null;
  private connectionPool: ConnectionPool | null = null;

  constructor(
    private config: ObservabilityConfig,
    private availableProviders: ProviderRegistry,
  ) {}

  /**
   * Check if provider is healthy and should be used
   */
  private shouldUseProvider(providerName: string): boolean {
    // Check health monitor if available
    if (this.healthMonitor) {
      const health = this.healthMonitor.getProviderHealth(providerName);
      if (health && !health.healthy) {
        if (this.config.debug) {
          console.debug(`[Observability] Skipping unhealthy provider: ${providerName}`);
        }
        return false;
      }
    }
    return true;
  }

  /**
   * Get health summary for all providers
   */
  getHealthSummary() {
    return (
      this.healthMonitor?.getHealthSummary() ?? {
        total: this.providers.size,
        healthy: this.providers.size,
        unhealthy: 0,
        providers: Array.from(this.providers.keys()).map((name: any) => ({
          name,
          healthy: true,
          errorCount: 0,
        })),
      }
    );
  }

  /**
   * Get connection pool statistics
   */
  getConnectionPoolStats() {
    return (
      this.connectionPool?.getStats() ?? {
        providers: [],
        totalConnections: 0,
        totalInUse: 0,
      }
    );
  }

  /**
   * Execute provider method with circuit breaker protection
   */
  private async executeWithCircuitBreaker<T>(
    providerName: string,
    provider: ObservabilityProvider,
    operation: () => Promise<T>,
    fallback?: T,
  ): Promise<T | undefined> {
    let circuitBreaker = this.circuitBreakers.get(providerName);

    if (!circuitBreaker) {
      circuitBreaker = createCircuitBreaker(providerName, {
        failureThreshold: this.config.circuitBreaker?.failureThreshold ?? 5,
        resetTimeout: this.config.circuitBreaker?.resetTimeout ?? 60000,
        failureWindow: this.config.circuitBreaker?.failureWindow ?? 60000,
        successThreshold: this.config.circuitBreaker?.successThreshold ?? 3,
        onOpen: (name: any) => {
          if (this.config.onProviderError) {
            this.config.onProviderError(new Error(`Circuit opened for provider: ${name}`), {
              provider: name,
              circuitState: 'OPEN',
            });
          }
        },
      });
      this.circuitBreakers.set(providerName, circuitBreaker);
    }

    try {
      return await circuitBreaker.execute(operation);
    } catch (error: any) {
      if (this.config.onError) {
        this.config.onError(error, {
          method: 'executeWithCircuitBreaker',
          provider: providerName,
          circuitBreakerState: circuitBreaker.getState(),
        });
      }
      return fallback;
    }
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    const breadcrumbWithTimestamp = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
    };

    for (const provider of this.providers.values()) {
      if (provider.addBreadcrumb) {
        try {
          provider.addBreadcrumb(breadcrumbWithTimestamp);
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { method: 'addBreadcrumb', provider: provider.name });
          }
        }
      }
    }
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    const mergedContext = mergeObservabilityContext(this.context, context);

    const promises: Promise<any>[] = [];

    for (const [providerName, provider] of this.providers) {
      // Skip unhealthy providers
      if (!this.shouldUseProvider(providerName)) {
        continue;
      }

      const promise = this.executeWithCircuitBreaker(providerName, provider, () =>
        withTimeout(
          provider.captureException(error, mergedContext),
          this.timeouts.CAPTURE_EXCEPTION,
          `${providerName}.captureException`,
        ),
      );
      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    const mergedContext = mergeObservabilityContext(this.context, context);

    const promises: Promise<any>[] = [];

    for (const [providerName, provider] of this.providers) {
      // Skip unhealthy providers
      if (!this.shouldUseProvider(providerName)) {
        continue;
      }

      const promise = this.executeWithCircuitBreaker(providerName, provider, () =>
        withTimeout(
          provider.captureMessage(message, level, mergedContext),
          this.timeouts.CAPTURE_MESSAGE,
          `${providerName}.captureMessage`,
        ),
      );
      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  endSession(): void {
    for (const provider of this.providers.values()) {
      if (provider.endSession) {
        try {
          provider.endSession();
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { method: 'endSession', provider: provider.name });
          }
        }
      }
    }
  }

  async initialize(): Promise<void> {
    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized) return;

    // Create and store the initialization promise
    this.initializationPromise = this.performInitialization();

    try {
      await this.initializationPromise;
    } catch (error: any) {
      // Reset on failure to allow retry
      this.initializationPromise = null;
      throw error;
    }
  }

  private async performInitialization(): Promise<void> {
    const initPromises: Promise<void>[] = [];

    for (const [providerName, providerConfig] of Object.entries(this.config.providers)) {
      const providerFactory = this.availableProviders[providerName];

      if (providerFactory) {
        try {
          // Handle both sync and async provider factories
          const providerResult = providerFactory(providerConfig);
          const provider = await Promise.resolve(providerResult);

          this.providers.set(providerName, provider);

          // Initialize provider with timeout and error boundary
          initPromises.push(
            withTimeout(
              provider.initialize(providerConfig),
              this.timeouts.PROVIDER_INIT,
              `${providerName}.initialize`,
            ).catch((error: any) => {
              if (this.config.onError) {
                this.config.onError(error, { method: 'initialize', provider: providerName });
              }
              // Remove failed provider to ensure it doesn't affect others
              this.providers.delete(providerName);
              // Continue with other providers
            }),
          );
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { method: 'create', provider: providerName });
          }
          // Continue with other providers
        }
      } else {
        // Provider not available in this environment - silently skip
        if (this.config.debug) {
          // Only log in debug mode
        }
      }
    }

    // Wait for all providers to initialize
    await Promise.allSettled(initPromises);

    // Set up cross-provider coordination
    // TODO: Temporarily disabled to resolve bundling issues
    // this.setupProviderCoordination();

    // Set initial context on providers
    this.syncContextToProviders();

    // Initialize connection pooling
    this.connectionPool = new ConnectionPool({
      maxConnections: this.config.connectionPool?.maxConnections ?? 3,
      idleTimeout: this.config.connectionPool?.idleTimeout ?? 300000,
      maxLifetime: this.config.connectionPool?.maxLifetime ?? 3600000,
      onConnectionClose: (providerId, reason: any) => {
        if (this.config.debug && this.config.onInfo) {
          this.config.onInfo(`Connection ${providerId} closed: ${reason}`);
        }
      },
    });

    // Initialize health monitoring
    this.healthMonitor = createHealthMonitor(this.providers, {
      timeout: this.timeouts.CAPTURE_MESSAGE,
      onHealthChange: (providerName, health: any) => {
        if (this.config.debug && this.config.onInfo) {
          this.config.onInfo(
            `Provider ${providerName} health changed: ${health.healthy ? 'healthy' : 'unhealthy'}`,
          );
        }
      },
    });

    // Start health monitoring if enabled
    if (this.config.healthCheck?.enabled !== false) {
      const interval = this.config.healthCheck?.intervalMs ?? 60000;
      this.healthMonitor.startMonitoring(interval);
    }

    this.isInitialized = true;
    if (this.config.debug && this.config.onInfo) {
      this.config.onInfo(
        `Observability initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    // If log level is 'error', also capture to error tracking providers (like Sentry)
    if (level === 'error' || level === 'fatal') {
      // Check if metadata contains an error object
      if (metadata?.error instanceof Error) {
        // Capture the error object with context
        await this.captureException(metadata.error, {
          extra: {
            message,
            ...metadata,
          },
          level: level as 'error' | 'fatal',
        });
      } else if (metadata instanceof Error) {
        // If metadata itself is an error
        await this.captureException(metadata, {
          extra: {
            message,
          },
          level: level as 'error' | 'fatal',
        });
      } else {
        // Capture as an error message
        await this.captureMessage(message, 'error', {
          extra: metadata,
          level: level as 'error' | 'fatal',
        });
      }
    }

    // Continue with normal log provider calls
    const promises: Promise<any>[] = [];

    for (const [providerName, provider] of this.providers) {
      if (!provider.log) continue;

      // Skip unhealthy providers
      if (!this.shouldUseProvider(providerName)) {
        continue;
      }

      const promise = this.executeWithCircuitBreaker(providerName, provider, () =>
        withTimeout(
          provider.log?.(level, message, metadata) ?? Promise.resolve(),
          this.timeouts.LOG_OPERATION,
          `${providerName}.log`,
        ),
      );
      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  setContext(key: string, context: Record<string, any>): void {
    this.contexts[key] = context;

    for (const provider of this.providers.values()) {
      if (provider.setContext) {
        try {
          provider.setContext(key, context);
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { key, method: 'setContext', provider: provider.name });
          }
        }
      }
    }
  }

  setExtra(key: string, value: any): void {
    this.extras[key] = value;

    for (const provider of this.providers.values()) {
      if (provider.setExtra) {
        try {
          provider.setExtra(key, value);
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { key, method: 'setExtra', provider: provider.name });
          }
        }
      }
    }
  }

  setTag(key: string, value: boolean | number | string): void {
    this.tags[key] = value;

    for (const provider of this.providers.values()) {
      if (provider.setTag) {
        try {
          provider.setTag(key, value);
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { key, method: 'setTag', provider: provider.name, value });
          }
        }
      }
    }
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    this.user = user;

    for (const provider of this.providers.values()) {
      if (provider.setUser) {
        try {
          provider.setUser(user);
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { method: 'setUser', provider: provider.name });
          }
        }
      }
    }
  }

  startSession(): void {
    for (const provider of this.providers.values()) {
      if (provider.startSession) {
        try {
          provider.startSession();
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { method: 'startSession', provider: provider.name });
          }
        }
      }
    }
  }

  startSpan(name: string, parentSpan?: any): any {
    const spans: any[] = [];

    for (const provider of this.providers.values()) {
      if (provider.startSpan) {
        try {
          const span = provider.startSpan(name, parentSpan);
          if (span) {
            spans.push(span);
          }
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, { method: 'startSpan', name, provider: provider.name });
          }
        }
      }
    }

    // Return a composite span object
    return spans.length > 0 ? spans : null;
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    const mergedContext = mergeObservabilityContext(this.context, context);
    const transactions: any[] = [];

    for (const provider of this.providers.values()) {
      if (provider.startTransaction) {
        try {
          const transaction = provider.startTransaction(name, mergedContext);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error: any) {
          if (this.config.onError) {
            this.config.onError(error, {
              method: 'startTransaction',
              name,
              provider: provider.name,
            });
          }
        }
      }
    }

    // Return a composite transaction object
    return transactions.length > 0 ? transactions : null;
  }

  /**
   * Set up cross-provider coordination for enhanced observability
   * This allows providers to share context and correlation IDs
   */
  private setupProviderCoordination(): void {
    const sentryProvider = this.providers.get('sentry');
    const logtailProvider = this.providers.get('logtail') || this.providers.get('better-stack');

    // Enable coordination between Sentry and Better Stack (if both exist)
    if (sentryProvider && logtailProvider) {
      // Check if providers support coordination
      try {
        if (typeof (logtailProvider as any).setSentryProvider === 'function') {
          (logtailProvider as any).setSentryProvider(sentryProvider);
        }
        if (typeof (sentryProvider as any).setLogtailProvider === 'function') {
          (sentryProvider as any).setLogtailProvider(logtailProvider);
        }

        if (this.config.debug && this.config.onInfo) {
          this.config.onInfo('Cross-provider coordination enabled: Sentry ↔ Better Stack');
        }
      } catch (error: any) {
        // Silently continue if coordination setup fails
        if (this.config.debug && this.config.onError) {
          this.config.onError(error, { method: 'setupProviderCoordination', provider: 'manager' });
        }
      }
    }
  }

  private syncContextToProviders(): void {
    // Sync user
    if (this.user) {
      for (const provider of this.providers.values()) {
        if (provider.setUser) {
          provider.setUser(this.user);
        }
      }
    }

    // Sync tags
    for (const [key, value] of Object.entries(this.tags)) {
      for (const provider of this.providers.values()) {
        if (provider.setTag) {
          provider.setTag(key, value);
        }
      }
    }

    // Sync extras
    for (const [key, value] of Object.entries(this.extras)) {
      for (const provider of this.providers.values()) {
        if (provider.setExtra) {
          provider.setExtra(key, value);
        }
      }
    }

    // Sync contexts
    for (const [key, context] of Object.entries(this.contexts)) {
      for (const provider of this.providers.values()) {
        if (provider.setContext) {
          provider.setContext(key, context);
        }
      }
    }
  }

  /**
   * Clean up resources and stop monitoring
   */
  async cleanup(): Promise<void> {
    // Stop health monitoring
    if (this.healthMonitor) {
      this.healthMonitor.stopMonitoring();
    }

    // Close connection pool
    if (this.connectionPool) {
      this.connectionPool.close();
    }

    // Clear providers
    this.providers.clear();
    this.circuitBreakers.clear();

    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

export function createObservabilityManager(
  config: ObservabilityConfig,
  providers: ProviderRegistry,
): ObservabilityManager {
  return new ObservabilityManager(config, providers);
}
