/**
 * Observability Manager - Core orchestration for multi-provider observability
 */

/* eslint-disable promise/no-promise-in-callback */

import type {
  Breadcrumb,
  ObservabilityManager as IObservabilityManager,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityProvider,
  ProviderRegistry,
} from '../types/types';

export class ObservabilityManager implements IObservabilityManager {
  private providers = new Map<string, ObservabilityProvider>();
  private context: ObservabilityContext = {};
  private isInitialized = false;
  private user: { id: string; email?: string; username?: string; [key: string]: any } | null = null;
  private tags: Record<string, string | number | boolean> = {};
  private extras: Record<string, any> = {};
  private contexts: Record<string, Record<string, any>> = {};

  constructor(
    private config: ObservabilityConfig,
    private availableProviders: ProviderRegistry,
  ) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const initPromises: Promise<void>[] = [];

    for (const [providerName, providerConfig] of Object.entries(this.config.providers)) {
      const providerFactory = this.availableProviders[providerName];

      if (providerFactory) {
        try {
          const provider = providerFactory(providerConfig);
          this.providers.set(providerName, provider);

          // Initialize provider with error boundary
          initPromises.push(
            provider.initialize(providerConfig).catch((error) => {
              if (this.config.onError) {
                this.config.onError(error, { provider: providerName, method: 'initialize' });
              }
              // Remove failed provider to ensure it doesn't affect others
              this.providers.delete(providerName);
              // Continue with other providers
            }),
          );
        } catch (error) {
          if (this.config.onError) {
            this.config.onError(error, { provider: providerName, method: 'create' });
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

    this.isInitialized = true;
    if (this.config.debug && this.config.onInfo) {
      this.config.onInfo(
        `Observability initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`,
      );
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

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    const mergedContext = { ...this.context, ...context };

    const providers = Array.from(this.providers.values());
    const promises: Promise<any>[] = [];

    for (const provider of providers) {
      const promise = provider.captureException(error, mergedContext).catch((err) => {
        if (this.config.onError) {
          this.config.onError(err, {
            provider: provider.name,
            method: 'captureException',
            originalError: error,
          });
        }
        return undefined; // Explicitly return undefined for caught errors
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: ObservabilityContext,
  ): Promise<void> {
    const mergedContext = { ...this.context, ...context };

    const providers = Array.from(this.providers.values());
    const promises: Promise<any>[] = [];

    for (const provider of providers) {
      const promise = provider.captureMessage(message, level, mergedContext).catch((err) => {
        if (this.config.onError) {
          this.config.onError(err, {
            provider: provider.name,
            level,
            message,
            method: 'captureMessage',
          });
        }
        return undefined; // Explicitly return undefined for caught errors
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    const providersWithLog = Array.from(this.providers.values()).filter((provider) => provider.log);
    const promises: Promise<any>[] = [];

    for (const provider of providersWithLog) {
      const promise = provider.log!(level, message, metadata).catch((err) => {
        if (this.config.onError) {
          this.config.onError(err, { provider: provider.name, level, message, method: 'log' });
        }
        return undefined; // Explicitly return undefined for caught errors
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    const mergedContext = { ...this.context, ...context };
    const transactions: any[] = [];

    for (const provider of this.providers.values()) {
      if (provider.startTransaction) {
        try {
          const transaction = provider.startTransaction(name, mergedContext);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, name, method: 'startTransaction' });
          }
        }
      }
    }

    // Return a composite transaction object
    return transactions.length > 0 ? transactions : null;
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
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, name, method: 'startSpan' });
          }
        }
      }
    }

    // Return a composite span object
    return spans.length > 0 ? spans : null;
  }

  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void {
    this.user = user;

    for (const provider of this.providers.values()) {
      if (provider.setUser) {
        try {
          provider.setUser(user);
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, method: 'setUser' });
          }
        }
      }
    }
  }

  setTag(key: string, value: string | number | boolean): void {
    this.tags[key] = value;

    for (const provider of this.providers.values()) {
      if (provider.setTag) {
        try {
          provider.setTag(key, value);
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, key, method: 'setTag', value });
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
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, key, method: 'setExtra' });
          }
        }
      }
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    this.contexts[key] = context;

    for (const provider of this.providers.values()) {
      if (provider.setContext) {
        try {
          provider.setContext(key, context);
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, key, method: 'setContext' });
          }
        }
      }
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
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, method: 'addBreadcrumb' });
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
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, method: 'startSession' });
          }
        }
      }
    }
  }

  endSession(): void {
    for (const provider of this.providers.values()) {
      if (provider.endSession) {
        try {
          provider.endSession();
        } catch (err) {
          if (this.config.onError) {
            this.config.onError(err, { provider: provider.name, method: 'endSession' });
          }
        }
      }
    }
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
      } catch (error) {
        // Silently continue if coordination setup fails
        if (this.config.debug && this.config.onError) {
          this.config.onError(error, { provider: 'manager', method: 'setupProviderCoordination' });
        }
      }
    }
  }
}

export function createObservabilityManager(
  config: ObservabilityConfig,
  providers: ProviderRegistry,
): ObservabilityManager {
  return new ObservabilityManager(config, providers);
}
