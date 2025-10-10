/**
 * Lazy-loading Multi-Provider Orchestration - Tree-shaking optimized
 * Providers are loaded only when needed via dynamic imports
 */

import type { MinimalAdapter } from '../adapters/minimal-adapter';
import type {
  AnalyticsEvent,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  ProviderType,
} from '../types';

export interface LazyProviderConfig {
  enabled: boolean;
  priority: number;
  loader: () => Promise<MinimalAdapter>;
  routingRules?: Array<{
    condition: (event: AnalyticsEvent) => boolean;
    action: 'include' | 'exclude' | 'route_only';
  }>;
}

export interface LazyOrchestrationConfig {
  providers: Record<ProviderType, LazyProviderConfig>;
  execution: {
    mode: 'parallel' | 'sequential' | 'failover';
    continueOnError: boolean;
    timeout?: number;
  };
}

export interface ExecutionResult {
  success: boolean;
  results: Record<
    ProviderType,
    {
      success: boolean;
      error?: Error;
      duration: number;
      loaded: boolean;
    }
  >;
  totalDuration: number;
}

export class LazyMultiProvider {
  private loadedProviders = new Map<ProviderType, MinimalAdapter>();
  private loadingPromises = new Map<ProviderType, Promise<MinimalAdapter>>();

  constructor(private config: LazyOrchestrationConfig) {}

  async track(event: AnalyticsEvent): Promise<ExecutionResult> {
    const startTime = Date.now();
    const targetProviders = this.getTargetProviders(event);

    if (targetProviders.length === 0) {
      return {
        success: true,
        results: {},
        totalDuration: Date.now() - startTime,
      };
    }

    const results = await this.executeOperation(targetProviders, adapter => adapter.track(event));

    return {
      success: Object.values(results).some(r => r.success),
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  async identify(payload: IdentifyPayload): Promise<ExecutionResult> {
    const startTime = Date.now();
    const targetProviders = Object.keys(this.config.providers).filter(
      provider => this.config.providers[provider as ProviderType].enabled,
    ) as ProviderType[];

    const results = await this.executeOperation(targetProviders, adapter =>
      adapter.identify(payload),
    );

    return {
      success: Object.values(results).some(r => r.success),
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  async group(payload: GroupPayload): Promise<ExecutionResult> {
    const startTime = Date.now();
    const targetProviders = Object.keys(this.config.providers).filter(
      provider => this.config.providers[provider as ProviderType].enabled,
    ) as ProviderType[];

    const results = await this.executeOperation(targetProviders, adapter => adapter.group(payload));

    return {
      success: Object.values(results).some(r => r.success),
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  async page(payload: PagePayload): Promise<ExecutionResult> {
    const startTime = Date.now();
    const targetProviders = Object.keys(this.config.providers).filter(
      provider => this.config.providers[provider as ProviderType].enabled,
    ) as ProviderType[];

    const results = await this.executeOperation(targetProviders, adapter => adapter.page(payload));

    return {
      success: Object.values(results).some(r => r.success),
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  private getTargetProviders(event: AnalyticsEvent): ProviderType[] {
    const targets: Array<{ type: ProviderType; priority: number }> = [];

    Object.entries(this.config.providers).forEach(([providerType, config]) => {
      if (!config.enabled) return;

      const provider = providerType as ProviderType;

      // Check routing rules
      if (config.routingRules) {
        let shouldInclude = true;
        let routeOnly = false;

        for (const rule of config.routingRules) {
          if (rule.condition(event)) {
            switch (rule.action) {
              case 'exclude':
                shouldInclude = false;
                break;
              case 'route_only':
                routeOnly = true;
                targets.length = 0; // Clear previous targets
                break;
              case 'include':
                shouldInclude = true;
                break;
            }
          }
        }

        if (!shouldInclude && !routeOnly) return;
        if (routeOnly) {
          targets.push({ type: provider, priority: config.priority });
          return;
        }
      }

      targets.push({ type: provider, priority: config.priority });
    });

    // Sort by priority (higher first)
    return targets.sort((a, b) => b.priority - a.priority).map(t => t.type);
  }

  private async loadProvider(providerType: ProviderType): Promise<MinimalAdapter> {
    // Check if already loaded
    const existing = this.loadedProviders.get(providerType);
    if (existing) return existing;

    // Check if currently loading
    const loadingPromise = this.loadingPromises.get(providerType);
    if (loadingPromise) return loadingPromise;

    // Start loading
    const config = this.config.providers[providerType];
    const promise = config.loader();

    this.loadingPromises.set(providerType, promise);

    try {
      const adapter = await promise;
      this.loadedProviders.set(providerType, adapter);
      this.loadingPromises.delete(providerType);
      return adapter;
    } catch (error) {
      this.loadingPromises.delete(providerType);
      throw error;
    }
  }

  private async executeOperation(
    providers: ProviderType[],
    operation: (adapter: MinimalAdapter) => Promise<boolean>,
  ): Promise<
    Record<ProviderType, { success: boolean; error?: Error; duration: number; loaded: boolean }>
  > {
    const results: Record<
      string,
      { success: boolean; error?: Error; duration: number; loaded: boolean }
    > = {};

    switch (this.config.execution.mode) {
      case 'parallel':
        return await this.executeParallel(providers, operation);

      case 'sequential':
        return await this.executeSequential(providers, operation);

      case 'failover':
        return await this.executeFailover(providers, operation);

      default:
        return results as Record<
          ProviderType,
          { success: boolean; error?: Error; duration: number; loaded: boolean }
        >;
    }
  }

  private async executeParallel(
    providers: ProviderType[],
    operation: (adapter: MinimalAdapter) => Promise<boolean>,
  ): Promise<
    Record<ProviderType, { success: boolean; error?: Error; duration: number; loaded: boolean }>
  > {
    const promises = providers.map(async providerType => {
      const startTime = Date.now();

      try {
        const adapter = await this.loadProvider(providerType);
        const success = await this.withTimeout(
          operation(adapter),
          this.config.execution.timeout || 10000,
        );

        return {
          providerType,
          result: {
            success,
            duration: Date.now() - startTime,
            loaded: true,
          },
        };
      } catch (error) {
        return {
          providerType,
          result: {
            success: false,
            error: error as Error,
            duration: Date.now() - startTime,
            loaded: this.loadedProviders.has(providerType),
          },
        };
      }
    });

    const resolved = await Promise.all(promises);

    return resolved.reduce(
      (acc, { providerType, result }) => {
        acc[providerType] = result;
        return acc;
      },
      {} as Record<
        ProviderType,
        { success: boolean; error?: Error; duration: number; loaded: boolean }
      >,
    );
  }

  private async executeSequential(
    providers: ProviderType[],
    operation: (adapter: MinimalAdapter) => Promise<boolean>,
  ): Promise<
    Record<ProviderType, { success: boolean; error?: Error; duration: number; loaded: boolean }>
  > {
    const results: Record<
      string,
      { success: boolean; error?: Error; duration: number; loaded: boolean }
    > = {};

    for (const providerType of providers) {
      const startTime = Date.now();

      try {
        const adapter = await this.loadProvider(providerType);
        const success = await this.withTimeout(
          operation(adapter),
          this.config.execution.timeout || 10000,
        );

        results[providerType] = {
          success,
          duration: Date.now() - startTime,
          loaded: true,
        };

        if (!this.config.execution.continueOnError && !success) {
          break;
        }
      } catch (error) {
        results[providerType] = {
          success: false,
          error: error as Error,
          duration: Date.now() - startTime,
          loaded: this.loadedProviders.has(providerType),
        };

        if (!this.config.execution.continueOnError) {
          break;
        }
      }
    }

    return results as Record<
      ProviderType,
      { success: boolean; error?: Error; duration: number; loaded: boolean }
    >;
  }

  private async executeFailover(
    providers: ProviderType[],
    operation: (adapter: MinimalAdapter) => Promise<boolean>,
  ): Promise<
    Record<ProviderType, { success: boolean; error?: Error; duration: number; loaded: boolean }>
  > {
    const results: Record<
      string,
      { success: boolean; error?: Error; duration: number; loaded: boolean }
    > = {};

    for (const providerType of providers) {
      const startTime = Date.now();

      try {
        const adapter = await this.loadProvider(providerType);
        const success = await this.withTimeout(
          operation(adapter),
          this.config.execution.timeout || 10000,
        );

        results[providerType] = {
          success,
          duration: Date.now() - startTime,
          loaded: true,
        };

        if (success) {
          break; // Success, no need to try other providers
        }
      } catch (error) {
        results[providerType] = {
          success: false,
          error: error as Error,
          duration: Date.now() - startTime,
          loaded: this.loadedProviders.has(providerType),
        };
      }
    }

    return results as Record<
      ProviderType,
      { success: boolean; error?: Error; duration: number; loaded: boolean }
    >;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  async flush(): Promise<void> {
    const flushPromises = Array.from(this.loadedProviders.values()).map(
      adapter => adapter.flush?.() || Promise.resolve(true),
    );

    await Promise.all(flushPromises);
  }

  async destroy(): Promise<void> {
    const destroyPromises = Array.from(this.loadedProviders.values()).map(adapter =>
      adapter.destroy(),
    );

    await Promise.all(destroyPromises);

    this.loadedProviders.clear();
    this.loadingPromises.clear();
  }

  // Health monitoring
  getProviderStatus(): Record<
    ProviderType,
    { enabled: boolean; loaded: boolean; loading: boolean }
  > {
    const status: Record<string, { enabled: boolean; loaded: boolean; loading: boolean }> = {};

    Object.entries(this.config.providers).forEach(([providerType, config]) => {
      status[providerType] = {
        enabled: config.enabled,
        loaded: this.loadedProviders.has(providerType as ProviderType),
        loading: this.loadingPromises.has(providerType as ProviderType),
      };
    });

    return status as Record<ProviderType, { enabled: boolean; loaded: boolean; loading: boolean }>;
  }
}
