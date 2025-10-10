/**
 * Multi-Provider Analytics Orchestration
 * Manages multiple analytics providers with failover and routing
 */

import type { AnalyticsEvent, ProviderAdapter, ProviderType } from '../types';
import { EventBatcher } from '../utils/batching';
import { PrivacyManager } from '../utils/privacy';
import { RetryManager } from '../utils/retry';
import { validateEvent } from '../utils/validation';

export interface ProviderConfig {
  adapter: ProviderAdapter;
  enabled: boolean;
  priority: number;
  failover?: boolean;
  routingRules?: ProviderRoutingRule[];
  batchingConfig?: {
    enabled: boolean;
    maxSize: number;
    flushInterval: number;
  };
}

export interface ProviderRoutingRule {
  condition: (event: AnalyticsEvent) => boolean;
  action: 'include' | 'exclude' | 'route_only';
}

export interface OrchestrationConfig {
  providers: Record<ProviderType, ProviderConfig>;
  defaultBehavior: {
    failover: boolean;
    parallelExecution: boolean;
    continueOnError: boolean;
  };
  privacy: {
    enabled: boolean;
    consentRequired: boolean;
  };
  validation: {
    enabled: boolean;
    strictMode: boolean;
  };
}

export interface ExecutionResult {
  success: boolean;
  results: Record<
    ProviderType,
    {
      success: boolean;
      error?: Error;
      duration?: number;
    }
  >;
  totalDuration: number;
}

export class MultiProviderOrchestrator {
  private config: OrchestrationConfig;
  private privacyManager: PrivacyManager;
  private retryManager: RetryManager;
  private batchers: Record<string, EventBatcher>;

  constructor(config: OrchestrationConfig) {
    this.config = config;
    this.privacyManager = new PrivacyManager();
    this.retryManager = new RetryManager({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    });
    this.batchers = {};

    this.setupBatchers();
  }

  private setupBatchers(): void {
    Object.entries(this.config.providers).forEach(([providerType, config]) => {
      if (config.batchingConfig?.enabled) {
        const batcher = new EventBatcher(
          {
            enabled: true,
            maxSize: config.batchingConfig.maxSize || 100,
            flushInterval: config.batchingConfig.flushInterval || 5000,
          },
          async batch => {
            return this.processBatch(providerType as ProviderType, batch);
          },
        );
        this.batchers[providerType] = batcher;
      }
    });
  }

  async track(event: AnalyticsEvent): Promise<ExecutionResult> {
    const startTime = Date.now();

    // Privacy check
    if (this.config.privacy.enabled && !this.privacyManager.canTrack('analytics')) {
      return {
        success: true,
        results: {},
        totalDuration: Date.now() - startTime,
      };
    }

    // Validation
    if (this.config.validation.enabled) {
      const validation = validateEvent(event);
      if (!validation.valid && this.config.validation.strictMode) {
        throw new Error(`Event validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Determine target providers
    const targetProviders = this.getTargetProviders(event);

    if (targetProviders.length === 0) {
      return {
        success: true,
        results: {},
        totalDuration: Date.now() - startTime,
      };
    }

    // Execute tracking
    const results = this.config.defaultBehavior.parallelExecution
      ? await this.executeParallel(event, targetProviders)
      : await this.executeSequential(event, targetProviders);

    return {
      success: Object.values(results).some(r => r.success),
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  private getTargetProviders(
    event: AnalyticsEvent,
  ): Array<{ type: ProviderType; config: ProviderConfig }> {
    const targets: Array<{ type: ProviderType; config: ProviderConfig }> = [];

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
          targets.push({ type: provider, config });
          return;
        }
      }

      targets.push({ type: provider, config });
    });

    // Sort by priority
    return targets.sort((a, b) => b.config.priority - a.config.priority);
  }

  private async executeParallel(
    event: AnalyticsEvent,
    providers: Array<{ type: ProviderType; config: ProviderConfig }>,
  ): Promise<Record<ProviderType, { success: boolean; error?: Error; duration?: number }>> {
    const promises = providers.map(({ type, config }) =>
      this.executeForProvider(event, type, config)
        .then(result => ({ type, result }))
        .catch(error => ({ type, result: { success: false, error, duration: 0 } })),
    );

    const results = await Promise.all(promises);

    return results.reduce(
      (acc, { type, result }) => {
        acc[type] = result;
        return acc;
      },
      {} as Record<ProviderType, { success: boolean; error?: Error; duration?: number }>,
    );
  }

  private async executeSequential(
    event: AnalyticsEvent,
    providers: Array<{ type: ProviderType; config: ProviderConfig }>,
  ): Promise<Record<ProviderType, { success: boolean; error?: Error; duration?: number }>> {
    const results: Record<ProviderType, { success: boolean; error?: Error; duration?: number }> =
      {};

    for (const { type, config } of providers) {
      try {
        results[type] = await this.executeForProvider(event, type, config);

        // If failover is disabled and we got a success, we might want to continue to all providers
        if (!this.config.defaultBehavior.failover && results[type].success) {
          continue;
        }

        // If failover is enabled and this provider succeeded, we can stop here
        if (this.config.defaultBehavior.failover && results[type].success) {
          break;
        }
      } catch (error) {
        results[type] = { success: false, error: error as Error, duration: 0 };

        if (!this.config.defaultBehavior.continueOnError) {
          break;
        }
      }
    }

    return results;
  }

  private async executeForProvider(
    event: AnalyticsEvent,
    providerType: ProviderType,
    config: ProviderConfig,
  ): Promise<{ success: boolean; error?: Error; duration: number }> {
    const startTime = Date.now();

    try {
      // Check if batching is enabled for this provider
      const batcher = this.batchers[providerType];
      if (batcher) {
        await batcher.add({
          id: `${Date.now()}-${Math.random()}`,
          data: event,
          timestamp: new Date(),
          retryCount: 0,
        });
        return { success: true, duration: Date.now() - startTime };
      }

      // Direct execution
      const success = await this.retryManager.execute(
        () => config.adapter.track(event),
        `${providerType}_track`,
      );

      return {
        success,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        duration: Date.now() - startTime,
      };
    }
  }

  private async processBatch(providerType: ProviderType, batch: any[]): Promise<boolean> {
    const config = this.config.providers[providerType];
    if (!config) return false;

    try {
      // Process batch through provider's batch method if available
      if ('trackBatch' in config.adapter && typeof config.adapter.trackBatch === 'function') {
        return await config.adapter.trackBatch(batch.map(item => item.data));
      }

      // Fallback to individual tracking
      const results = await Promise.allSettled(batch.map(item => config.adapter.track(item.data)));

      return results.every(result => result.status === 'fulfilled' && result.value);
    } catch (error) {
      console.error(`Batch processing failed for ${providerType}:`, error);
      return false;
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<ExecutionResult> {
    const startTime = Date.now();
    const results: Record<ProviderType, { success: boolean; error?: Error; duration?: number }> =
      {};

    for (const [providerType, config] of Object.entries(this.config.providers)) {
      if (!config.enabled) continue;

      const provider = providerType as ProviderType;
      const providerStartTime = Date.now();

      try {
        await config.adapter.identify(userId, traits);
        results[provider] = {
          success: true,
          duration: Date.now() - providerStartTime,
        };
      } catch (error) {
        results[provider] = {
          success: false,
          error: error as Error,
          duration: Date.now() - providerStartTime,
        };
      }
    }

    return {
      success: Object.values(results).some(r => r.success),
      results,
      totalDuration: Date.now() - startTime,
    };
  }

  async flush(): Promise<void> {
    // Flush all batchers
    await Promise.all(Object.values(this.batchers).map(batcher => batcher.flush()));

    // Flush all adapters
    const flushPromises = Object.values(this.config.providers)
      .filter(config => config.enabled)
      .map(config => config.adapter.flush?.());

    await Promise.all(flushPromises.filter(Boolean));
  }

  updateProviderConfig(providerType: ProviderType, updates: Partial<ProviderConfig>): void {
    if (this.config.providers[providerType]) {
      this.config.providers[providerType] = {
        ...this.config.providers[providerType],
        ...updates,
      };
    }
  }

  getProviderHealth(): Record<
    ProviderType,
    { enabled: boolean; healthy: boolean; lastError?: string }
  > {
    const health: Record<string, { enabled: boolean; healthy: boolean; lastError?: string }> = {};

    Object.entries(this.config.providers).forEach(([providerType, config]) => {
      health[providerType] = {
        enabled: config.enabled,
        healthy: true, // This could be enhanced with actual health checks
        lastError: undefined,
      };
    });

    return health as Record<
      ProviderType,
      { enabled: boolean; healthy: boolean; lastError?: string }
    >;
  }
}

// Builder for creating orchestration configurations
export class OrchestrationBuilder {
  private config: Partial<OrchestrationConfig> = {
    providers: {},
    defaultBehavior: {
      failover: false,
      parallelExecution: true,
      continueOnError: true,
    },
    privacy: {
      enabled: true,
      consentRequired: true,
    },
    validation: {
      enabled: true,
      strictMode: false,
    },
  };

  addProvider(
    type: ProviderType,
    adapter: ProviderAdapter,
    options: Partial<ProviderConfig> = {},
  ): this {
    this.config.providers![type] = {
      adapter,
      enabled: true,
      priority: 0,
      failover: false,
      ...options,
    };
    return this;
  }

  setDefaultBehavior(behavior: Partial<OrchestrationConfig['defaultBehavior']>): this {
    this.config.defaultBehavior = {
      ...this.config.defaultBehavior!,
      ...behavior,
    };
    return this;
  }

  setPrivacyOptions(privacy: Partial<OrchestrationConfig['privacy']>): this {
    this.config.privacy = {
      ...this.config.privacy!,
      ...privacy,
    };
    return this;
  }

  setValidationOptions(validation: Partial<OrchestrationConfig['validation']>): this {
    this.config.validation = {
      ...this.config.validation!,
      ...validation,
    };
    return this;
  }

  build(): MultiProviderOrchestrator {
    return new MultiProviderOrchestrator(this.config as OrchestrationConfig);
  }
}
