/**
 * Client-side Observability Manager
 * Browser-safe version with no Node.js dependencies
 * React 19 and Next.js 15 optimized with bundle splitting
 */

import {
  Breadcrumb,
  ObservabilityManager as IObservabilityManager,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityProvider,
  ProviderRegistry,
} from '../../shared/types/types';
import { mergeObservabilityContext } from '../../shared/utils/config';
import {
  createLazyProviderLoader,
  initializeProvidersConcurrently,
  preloadProviders,
} from '../../shared/utils/lazy-loading';

export class ClientObservabilityManager implements IObservabilityManager {
  private context: ObservabilityContext = {};
  private contexts: Record<string, Record<string, any>> = {};
  private extras: Record<string, any> = {};
  private isInitialized = false;
  private providers = new Map<string, ObservabilityProvider>();
  private tags: Record<string, boolean | number | string> = {};
  private user: null | { [key: string]: any; email?: string; id: string; username?: string } = null;

  constructor(
    private config: ObservabilityConfig,
    private availableProviders: ProviderRegistry,
  ) {}

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    const breadcrumbWithTimestamp = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
    };

    for (const provider of Array.from(this.providers.values())) {
      if (provider.addBreadcrumb) {
        try {
          provider.addBreadcrumb(breadcrumbWithTimestamp);
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in addBreadcrumb: ${error}`);
        }
      }
    }
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    const mergedContext = mergeObservabilityContext(this.context, context);

    const providers = Array.from(this.providers.values());
    const promises: Promise<any>[] = [];

    for (const provider of providers) {
      const promise = provider.captureException(error, mergedContext).catch((err: any) => {
        if (this.config.onError) {
          this.config.onError(err, {
            method: 'captureException',
            originalError: error,
            provider: provider.name,
          });
        }
        return undefined;
      });
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

    const providers = Array.from(this.providers.values());
    const promises: Promise<any>[] = [];

    for (const provider of providers) {
      const promise = provider.captureMessage(message, level, mergedContext).catch((err: any) => {
        if (this.config.onError) {
          this.config.onError(err, {
            level,
            message,
            method: 'captureMessage',
            provider: provider.name,
          });
        }
        return undefined;
      });
      promises.push(promise);
    }

    await Promise.allSettled(promises);
  }

  endSession(): void {
    for (const provider of Array.from(this.providers.values())) {
      if (provider.endSession) {
        try {
          provider.endSession();
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in endSession: ${error}`);
        }
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // React 19: Use optimized lazy loading with caching
    const optimizedProviders = createLazyProviderLoader(this.availableProviders);

    // React 19: Preload providers for better performance
    const enabledProviders = Object.keys(this.config.providers);
    await preloadProviders(enabledProviders, this.availableProviders);

    try {
      // React 19: Concurrent initialization for better performance
      const initializedProviders = await initializeProvidersConcurrently(
        this.config.providers,
        optimizedProviders,
      );

      // Set initialized providers
      this.providers = initializedProviders;

      this.syncContextToProviders();
      this.isInitialized = true;

      if (this.config.debug && this.config.onInfo) {
        this.config.onInfo(
          `Observability initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`,
        );
      }
    } catch (error: any) {
      if (this.config.onError) {
        this.config.onError(error, { method: 'initialize', provider: 'manager' });
      }
      throw error;
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
    const providersWithLog = Array.from(this.providers.values()).filter(
      (provider: any) => provider.log,
    );
    const promises: Promise<any>[] = [];

    for (const provider of providersWithLog) {
      const promise = provider.log?.(level, message, metadata)?.catch((err: any) => {
        if (this.config.onError) {
          this.config.onError(err, { level, message, method: 'log', provider: provider.name });
        }
        return undefined;
      });
      if (promise) {
        promises.push(promise);
      }
    }

    await Promise.allSettled(promises);
  }

  setContext(key: string, context: Record<string, any>): void {
    this.contexts[key] = context;

    for (const provider of Array.from(this.providers.values())) {
      if (provider.setContext) {
        try {
          provider.setContext(key, context);
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in setContext: ${error}`);
        }
      }
    }
  }

  setExtra(key: string, value: any): void {
    this.extras[key] = value;

    for (const provider of Array.from(this.providers.values())) {
      if (provider.setExtra) {
        try {
          provider.setExtra(key, value);
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in setExtra: ${error}`);
        }
      }
    }
  }

  setTag(key: string, value: boolean | number | string): void {
    this.tags[key] = value;

    for (const provider of Array.from(this.providers.values())) {
      if (provider.setTag) {
        try {
          provider.setTag(key, value);
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in setTag: ${error}`);
        }
      }
    }
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    this.user = user;

    for (const provider of Array.from(this.providers.values())) {
      if (provider.setUser) {
        try {
          provider.setUser(user);
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in setUser: ${error}`);
        }
      }
    }
  }

  startSession(): void {
    for (const provider of Array.from(this.providers.values())) {
      if (provider.startSession) {
        try {
          provider.startSession();
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in startSession: ${error}`);
        }
      }
    }
  }

  startSpan(name: string, parentSpan?: any): any {
    const spans: any[] = [];

    for (const provider of Array.from(this.providers.values())) {
      if (provider.startSpan) {
        try {
          const span = provider.startSpan(name, parentSpan);
          if (span) {
            spans.push(span);
          }
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in startSpan: ${error}`);
        }
      }
    }

    return spans.length > 0 ? spans : null;
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    const mergedContext = mergeObservabilityContext(this.context, context);
    const transactions: any[] = [];

    for (const provider of Array.from(this.providers.values())) {
      if (provider.startTransaction) {
        try {
          const transaction = provider.startTransaction(name, mergedContext);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error: any) {
          throw new Error(`[Observability] Provider error in startTransaction: ${error}`);
        }
      }
    }

    return transactions.length > 0 ? transactions : null;
  }

  private syncContextToProviders(): void {
    if (this.user) {
      for (const provider of Array.from(this.providers.values())) {
        if (provider.setUser) {
          provider.setUser(this.user);
        }
      }
    }

    for (const [key, value] of Object.entries(this.tags)) {
      for (const provider of Array.from(this.providers.values())) {
        if (provider.setTag) {
          provider.setTag(key, value);
        }
      }
    }

    for (const [key, value] of Object.entries(this.extras)) {
      for (const provider of Array.from(this.providers.values())) {
        if (provider.setExtra) {
          provider.setExtra(key, value);
        }
      }
    }

    for (const [key, context] of Object.entries(this.contexts)) {
      for (const provider of Array.from(this.providers.values())) {
        if (provider.setContext) {
          provider.setContext(key, context);
        }
      }
    }
  }
}

export function createClientObservabilityManager(
  config: ObservabilityConfig,
  providers: ProviderRegistry,
): ClientObservabilityManager {
  return new ClientObservabilityManager(config, providers);
}
