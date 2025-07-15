/**
 * Analytics Manager - Core orchestration for multi-provider analytics
 */

import type {
  EmitterAliasPayload,
  EmitterGroupPayload,
  EmitterIdentifyPayload,
  EmitterPagePayload,
  EmitterPayload,
  EmitterTrackPayload,
} from '../emitters/emitter-types';
import type {
  AnalyticsConfig,
  AnalyticsContext,
  AnalyticsProvider,
  ProviderRegistry,
  TrackingOptions,
} from '../types/types';

export class AnalyticsManager {
  private providers = new Map<string, AnalyticsProvider>();
  private context: AnalyticsContext = {};
  private isInitialized = false;

  constructor(
    private config: AnalyticsConfig,
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
            // Use async function to properly await
            (async () => {
              try {
                await provider.initialize(providerConfig);
              } catch (error) {
                if (this.config.onError) {
                  this.config.onError(error, { provider: providerName, method: 'initialize' });
                }
                // Remove failed provider to ensure it doesn't affect others
                this.providers.delete(providerName);
                // Continue with other providers
              }
            })(),
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

    this.isInitialized = true;
    if (this.config.debug && this.config.onInfo) {
      this.config.onInfo(
        `Analytics initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }
  }

  setContext(context: AnalyticsContext): void {
    this.context = { ...this.context, ...context };

    // Update context on providers that support it
    for (const provider of this.providers.values()) {
      if (provider.setContext) {
        provider.setContext(this.context);
      }
    }
  }

  getContext(): AnalyticsContext {
    return { ...this.context };
  }

  // TypeScript overloads for track method
  async track(payload: EmitterTrackPayload): Promise<void>;
  async track(event: string, properties?: any, options?: TrackingOptions): Promise<void>;
  async track(
    eventOrPayload: string | EmitterTrackPayload,
    properties?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (typeof eventOrPayload === 'object' && eventOrPayload.type === 'track') {
      const payload = eventOrPayload;
      return this.track(payload.event, payload.properties, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional track call
    const event = eventOrPayload as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error('Analytics not initialized'), {
          provider: 'analytics',
          event,
          method: 'track',
        });
      }
      return;
    }

    const targetProviders = this.getTargetProviders(options);
    const enhancedProperties = { ...this.context, ...properties };

    const promises = Array.from(targetProviders.entries()).map(async ([name, provider]) => {
      try {
        await provider.track(event, enhancedProperties, this.context);
      } catch (error) {
        // Error boundary: report error but don't let it affect other providers
        // Optionally report to error tracking service
        if (this.config.onError) {
          this.config.onError(error, { provider: name, event, method: 'track' });
        }
      }
    });

    // Use allSettled to ensure all providers are called even if some fail
    await Promise.allSettled(promises);
  }

  // TypeScript overloads for identify method
  async identify(payload: EmitterIdentifyPayload): Promise<void>;
  async identify(userId: string, traits?: any, options?: TrackingOptions): Promise<void>;
  async identify(
    userIdOrPayload: string | EmitterIdentifyPayload,
    traits?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (typeof userIdOrPayload === 'object' && userIdOrPayload.type === 'identify') {
      const payload = userIdOrPayload;
      return this.identify(payload.userId, payload.traits, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional identify call
    const userId = userIdOrPayload as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error('Analytics not initialized'), {
          provider: 'analytics',
          method: 'identify',
          userId,
        });
      }
      return;
    }

    // Update context with user info
    this.setContext({ userId, ...traits });

    const targetProviders = this.getTargetProviders(options);
    const enhancedTraits = { ...this.context, ...traits };

    const promises = Array.from(targetProviders.entries()).map(async ([name, provider]) => {
      if (provider.identify) {
        try {
          await provider.identify(userId, enhancedTraits, this.context);
        } catch (error) {
          // Error boundary: report error but don't let it affect other providers
          if (this.config.onError) {
            this.config.onError(error, { provider: name, method: 'identify', userId });
          }
        }
      }
    });

    await Promise.allSettled(promises);
  }

  // TypeScript overloads for page method
  async page(payload: EmitterPagePayload): Promise<void>;
  async page(name?: string, properties?: any, options?: TrackingOptions): Promise<void>;
  async page(
    nameOrPayload?: string | EmitterPagePayload,
    properties?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (typeof nameOrPayload === 'object' && nameOrPayload.type === 'page') {
      const payload = nameOrPayload;
      return this.page(payload.name, payload.properties, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional page call
    const name = nameOrPayload as string | undefined;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error('Analytics not initialized'), {
          provider: 'analytics',
          name,
          method: 'page',
        });
      }
      return;
    }

    const targetProviders = this.getTargetProviders(options);
    const enhancedProperties = { ...this.context, ...properties };

    const promises = Array.from(targetProviders.entries()).map(async ([providerName, provider]) => {
      if (provider.page) {
        try {
          await provider.page(name || '', enhancedProperties, this.context);
        } catch (error) {
          // Error boundary: report error but don't let it affect other providers
          if (this.config.onError) {
            this.config.onError(error, {
              provider: providerName,
              name: name || '',
              method: 'page',
            });
          }
        }
      }
    });

    await Promise.allSettled(promises);
  }

  // TypeScript overloads for group method
  async group(payload: EmitterGroupPayload): Promise<void>;
  async group(groupId: string, traits?: any, options?: TrackingOptions): Promise<void>;
  async group(
    groupIdOrPayload: string | EmitterGroupPayload,
    traits?: any,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (typeof groupIdOrPayload === 'object' && groupIdOrPayload.type === 'group') {
      const payload = groupIdOrPayload;
      return this.group(payload.groupId, payload.traits, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional group call
    const groupId = groupIdOrPayload as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error('Analytics not initialized'), {
          provider: 'analytics',
          groupId,
          method: 'group',
        });
      }
      return;
    }

    // Update context with group info
    this.setContext({ organizationId: groupId, ...traits });

    const targetProviders = this.getTargetProviders(options);
    const enhancedTraits = { ...this.context, ...traits };

    const promises = Array.from(targetProviders.entries()).map(async ([providerName, provider]) => {
      if (provider.group) {
        try {
          await provider.group(groupId, enhancedTraits, this.context);
        } catch (error) {
          // Error boundary: report error but don't let it affect other providers
          if (this.config.onError) {
            this.config.onError(error, { provider: providerName, groupId, method: 'group' });
          }
        }
      }
    });

    await Promise.allSettled(promises);
  }

  // TypeScript overloads for alias method
  async alias(payload: EmitterAliasPayload): Promise<void>;
  async alias(userId: string, previousId: string, options?: TrackingOptions): Promise<void>;
  async alias(
    userIdOrPayload: string | EmitterAliasPayload,
    previousId?: string,
    options?: TrackingOptions,
  ): Promise<void> {
    // If first argument is an emitter payload, use it
    if (typeof userIdOrPayload === 'object' && userIdOrPayload.type === 'alias') {
      const payload = userIdOrPayload;
      return this.alias(payload.userId, payload.previousId, {
        ...options,
        // Merge context from payload
        context: { ...this.context, ...payload.context },
      });
    }

    // Traditional alias call
    const userId = userIdOrPayload as string;
    const prevId = previousId as string;

    if (!this.isInitialized) {
      if (this.config.onError) {
        this.config.onError(new Error('Analytics not initialized'), {
          provider: 'analytics',
          method: 'alias',
          previousId: prevId,
          userId,
        });
      }
      return;
    }

    const targetProviders = this.getTargetProviders(options);

    const promises = Array.from(targetProviders.entries()).map(async ([providerName, provider]) => {
      if (provider.alias) {
        try {
          await provider.alias(userId, prevId, this.context);
        } catch (error) {
          // Error boundary: report error but don't let it affect other providers
          if (this.config.onError) {
            this.config.onError(error, {
              provider: providerName,
              method: 'alias',
              previousId: prevId,
              userId,
            });
          }
        }
      }
    });

    await Promise.allSettled(promises);
  }

  getActiveProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getProvider(name: string): AnalyticsProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Process any emitter payload (primary method for emitter-first approach)
   * This is the recommended way to use analytics with type-safe emitters
   */
  async emit(payload: EmitterPayload): Promise<void> {
    switch (payload.type) {
      case 'track':
        return this.track(payload);
      case 'identify':
        return this.identify(payload);
      case 'page':
        return this.page(payload);
      case 'group':
        return this.group(payload);
      case 'alias':
        return this.alias(payload);
      default:
        throw new Error(`Unknown emitter payload type: ${(payload as any).type}`);
    }
  }

  /**
   * Process an emitter payload (legacy method - use emit() instead)
   * @deprecated Use emit() for better type safety
   */
  async processEmitterPayload(payload: any): Promise<void> {
    return this.emit(payload);
  }

  /**
   * Batch emit multiple payloads
   * Useful for processing multiple events at once
   */
  async emitBatch(payloads: EmitterPayload[]): Promise<void> {
    await Promise.all(payloads.map(payload => this.emit(payload)));
  }

  /**
   * Create a bound emitter function for convenience
   * Returns a function that automatically calls emit on this manager
   */
  createEmitter(): (payload: EmitterPayload) => Promise<void> {
    return (payload: EmitterPayload) => this.emit(payload);
  }

  /**
   * Track an ecommerce event specification
   */
  async trackEcommerce(eventSpec: { name: string; properties: any }): Promise<void> {
    return this.track(eventSpec.name, eventSpec.properties);
  }

  private getTargetProviders(options?: TrackingOptions): Map<string, AnalyticsProvider> {
    let targetProviders = new Map(this.providers);

    if (options) {
      // Handle runtime provider additions
      if (options.providers) {
        for (const [name, config] of Object.entries(options.providers)) {
          const factory = this.availableProviders[name];
          if (factory) {
            try {
              const provider = factory(config);
              targetProviders.set(name, provider);
            } catch (error) {
              if (this.config.onError) {
                this.config.onError(error, { provider: name, method: 'runtime-create' });
              }
            }
          }
        }
      }

      // Handle 'only' option
      if (options.only) {
        const onlyProviders = new Map();
        for (const name of options.only) {
          if (targetProviders.has(name)) {
            onlyProviders.set(name, targetProviders.get(name));
          }
        }
        targetProviders = onlyProviders;
      }

      // Handle 'exclude' option
      if (options.exclude) {
        for (const name of options.exclude) {
          targetProviders.delete(name);
        }
      }
    }

    return targetProviders;
  }
}

// Factory function to create analytics manager
export function createAnalyticsManager(
  config: AnalyticsConfig,
  availableProviders: ProviderRegistry,
): AnalyticsManager {
  return new AnalyticsManager(config, availableProviders);
}
