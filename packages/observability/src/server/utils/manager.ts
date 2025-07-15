/**
 * Server-side Observability Manager
 * Node.js version with server-specific functionality
 */

import { isProduction } from '../../../env';
import {
  Breadcrumb,
  ObservabilityManager as IObservabilityManager,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityProvider,
  ProviderRegistry,
} from '../../shared/types/types';
import { mergeObservabilityContext } from '../../shared/utils/config';

export class ServerObservabilityManager implements IObservabilityManager {
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

    const initPromises: Promise<void>[] = [];

    for (const [providerName, providerConfig] of Object.entries(this.config.providers)) {
      const providerFactory = this.availableProviders[providerName];

      if (providerFactory) {
        try {
          const providerResult = providerFactory(providerConfig);
          const provider = await Promise.resolve(providerResult);

          this.providers.set(providerName, provider);

          initPromises.push(
            provider.initialize(providerConfig).catch((error: any) => {
              throw new Error(`[Observability] Provider initialization error: ${error}`);
            }),
          );
        } catch (error: any) {
          throw new Error(`[Observability] Provider creation error: ${error}`);
        }
      } else {
        // Provider not available in server environment - silently skip
        if (this.config.debug) {
          // Only log in debug mode using process/console (server-safe)
          if (!isProduction()) {
            console.warn(
              `[Observability] Provider '${providerName}' not available in server environment`,
            );
          }
        }
      }
    }

    await Promise.allSettled(initPromises);
    this.setupProviderCoordination();
    this.syncContextToProviders();
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

  /**
   * Set up cross-provider coordination for enhanced observability
   * This allows providers to share context and correlation IDs
   * Server-only feature due to provider complexity
   */
  private setupProviderCoordination(): void {
    const sentryProvider = this.providers.get('sentry');
    const logtailProvider = this.providers.get('logtail') || this.providers.get('better-stack');

    if (sentryProvider && logtailProvider) {
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
        throw new Error(`[Observability] Provider coordination error: ${error}`);
      }
    }
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

export function createServerObservabilityManager(
  config: ObservabilityConfig,
  providers: ProviderRegistry,
): ServerObservabilityManager {
  return new ServerObservabilityManager(config, providers);
}
