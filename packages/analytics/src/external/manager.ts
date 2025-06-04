/**
 * Analytics Manager - Core orchestration for multi-provider analytics
 */

import type { 
  AnalyticsProvider, 
  AnalyticsConfig, 
  ProviderRegistry, 
  TrackingOptions,
  AnalyticsContext 
} from './types';

export class AnalyticsManager {
  private providers = new Map<string, AnalyticsProvider>();
  private context: AnalyticsContext = {};
  private isInitialized = false;

  constructor(
    private config: AnalyticsConfig,
    private availableProviders: ProviderRegistry
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
          
          // Initialize provider
          initPromises.push(
            provider.initialize().catch(error => {
              console.warn(`Failed to initialize provider '${providerName}':`, error);
              // Remove failed provider
              this.providers.delete(providerName);
            })
          );
        } catch (error) {
          console.warn(`Failed to create provider '${providerName}':`, error);
        }
      } else {
        // Provider not available in this environment - silently skip
        console.debug(`Provider '${providerName}' not available in this environment`);
      }
    }

    // Wait for all providers to initialize
    await Promise.allSettled(initPromises);
    
    this.isInitialized = true;
    console.log(`Analytics initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`);
  }

  setContext(context: AnalyticsContext): void {
    this.context = { ...this.context, ...context };
  }

  getContext(): AnalyticsContext {
    return { ...this.context };
  }

  async track(event: string, properties: any = {}, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, cannot track event:', event);
      return;
    }

    const targetProviders = this.getTargetProviders(options);
    const enhancedProperties = { ...this.context, ...properties };

    const promises = Array.from(targetProviders.entries()).map(async ([name, provider]) => {
      try {
        await provider.track(event, enhancedProperties);
      } catch (error) {
        console.error(`Provider '${name}' track error:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  async identify(userId: string, traits: any = {}, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, cannot identify user');
      return;
    }

    // Update context with user info
    this.setContext({ userId, ...traits });

    const targetProviders = this.getTargetProviders(options);
    const enhancedTraits = { ...this.context, ...traits };

    const promises = Array.from(targetProviders.entries()).map(async ([name, provider]) => {
      if (provider.identify) {
        try {
          await provider.identify(userId, enhancedTraits);
        } catch (error) {
          console.error(`Provider '${name}' identify error:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  async page(name?: string, properties: any = {}, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, cannot track page');
      return;
    }

    const targetProviders = this.getTargetProviders(options);
    const enhancedProperties = { ...this.context, ...properties };

    const promises = Array.from(targetProviders.entries()).map(async ([name, provider]) => {
      if (provider.page) {
        try {
          await provider.page(name, enhancedProperties);
        } catch (error) {
          console.error(`Provider '${name}' page error:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  async group(groupId: string, traits: any = {}, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, cannot track group');
      return;
    }

    // Update context with group info
    this.setContext({ organizationId: groupId, ...traits });

    const targetProviders = this.getTargetProviders(options);
    const enhancedTraits = { ...this.context, ...traits };

    const promises = Array.from(targetProviders.entries()).map(async ([name, provider]) => {
      if (provider.group) {
        try {
          await provider.group(groupId, enhancedTraits);
        } catch (error) {
          console.error(`Provider '${name}' group error:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  async alias(userId: string, previousId: string, options?: TrackingOptions): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized, cannot alias user');
      return;
    }

    const targetProviders = this.getTargetProviders(options);

    const promises = Array.from(targetProviders.entries()).map(async ([name, provider]) => {
      if (provider.alias) {
        try {
          await provider.alias(userId, previousId);
        } catch (error) {
          console.error(`Provider '${name}' alias error:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  getActiveProviders(): string[] {
    return Array.from(this.providers.keys());
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
              console.warn(`Failed to create runtime provider '${name}':`, error);
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
  availableProviders: ProviderRegistry
): AnalyticsManager {
  return new AnalyticsManager(config, availableProviders);
}