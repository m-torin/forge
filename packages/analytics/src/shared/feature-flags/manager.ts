/**
 * Standardized Feature Flag Manager
 * Vendor-agnostic feature flag management with multi-provider support
 */

import { FeatureFlagError } from './types';

import type {
  CacheConfig,
  FeatureFlagManager,
  FeatureFlagProvider,
  FlagCache,
  FlagConfig,
  FlagContext,
  FlagEvaluationOptions,
  FlagEvaluationResult,
  FlagMetrics,
  FlagValue,
} from './types';

export class StandardFeatureFlagManager implements FeatureFlagManager {
  private providers = new Map<string, FeatureFlagProvider>();
  private primaryProvider?: string;
  private globalContext: FlagContext = {};
  private cache?: FlagCache;
  private metrics = new Map<string, FlagMetrics>();
  private isInitialized = false;
  private debug = false;

  constructor(options?: { cache?: FlagCache; debug?: boolean; primaryProvider?: string }) {
    this.cache = options?.cache;
    this.debug = options?.debug || false;
    this.primaryProvider = options?.primaryProvider;
  }

  // ============================================================================
  // PROVIDER MANAGEMENT
  // ============================================================================

  async addProvider(config: FlagConfig): Promise<void> {
    try {
      const provider = await this.createProvider(config);
      this.providers.set(config.provider, provider);

      // Set as primary if first provider or explicitly marked
      if (!this.primaryProvider || config.options?.primary) {
        this.primaryProvider = config.provider;
      }

      // Initialize metrics
      this.metrics.set(config.provider, {
        provider: config.provider,
        avgResponseTime: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        evaluations: 0,
      });

      this.log(`Provider ${config.provider} added successfully`);
    } catch (error) {
      throw new FeatureFlagError(
        `Failed to add provider ${config.provider}`,
        'INVALID_CONFIGURATION',
        config.provider,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  removeProvider(name: string): void {
    const provider = this.providers.get(name);
    if (provider) {
      provider.close();
      this.providers.delete(name);
      this.metrics.delete(name);

      if (this.primaryProvider === name) {
        this.primaryProvider = this.providers.keys().next().value;
      }

      this.log(`Provider ${name} removed`);
    }
  }

  getProvider(name: string): FeatureFlagProvider | undefined {
    return this.providers.get(name);
  }

  // ============================================================================
  // FLAG EVALUATION
  // ============================================================================

  async getFlag<T = FlagValue>(
    key: string,
    defaultValue: T,
    options?: FlagEvaluationOptions,
  ): Promise<FlagEvaluationResult<T>> {
    const startTime = performance.now();
    const providerName = options?.provider || this.primaryProvider;
    const context = { ...this.globalContext, ...options?.context };

    if (!providerName) {
      throw new FeatureFlagError(
        'No provider available for flag evaluation',
        'PROVIDER_NOT_FOUND',
        undefined,
        key,
      );
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new FeatureFlagError(
        `Provider ${providerName} not found`,
        'PROVIDER_NOT_FOUND',
        providerName,
        key,
      );
    }

    // Check cache first
    if (this.cache && !options?.context) {
      const cached = this.cache.get(`${providerName}:${key}`);
      if (cached && this.isCacheValid(cached)) {
        this.updateMetrics(providerName, startTime, true);
        this.log(`Cache hit for flag ${key}`);
        return cached as FlagEvaluationResult<T>;
      }
    }

    try {
      const result = await provider.getFlag(key, defaultValue, context);

      // Cache the result
      if (this.cache) {
        this.cache.set(`${providerName}:${key}`, result as FlagEvaluationResult);
      }

      // Track exposure if enabled
      if (options?.trackExposure !== false && provider.trackExposure) {
        provider.trackExposure(key, result as FlagEvaluationResult, context);
      }

      this.updateMetrics(providerName, startTime, false);
      this.log(`Flag ${key} evaluated:`, result);

      return result as FlagEvaluationResult<T>;
    } catch (error) {
      this.handleError(providerName, error, key);

      // Try fallback strategies
      return this.getFallbackValue(key, defaultValue, options, providerName);
    }
  }

  async getAllFlags(
    options?: FlagEvaluationOptions,
  ): Promise<Record<string, FlagEvaluationResult>> {
    const providerName = options?.provider || this.primaryProvider;
    const context = { ...this.globalContext, ...options?.context };

    if (!providerName) {
      throw new FeatureFlagError('No provider available for flag evaluation', 'PROVIDER_NOT_FOUND');
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new FeatureFlagError(
        `Provider ${providerName} not found`,
        'PROVIDER_NOT_FOUND',
        providerName,
      );
    }

    try {
      const flags = await provider.getAllFlags(context);

      // Cache all flags
      if (this.cache) {
        Object.entries(flags).forEach(([key, result]) => {
          this.cache!.set(`${providerName}:${key}`, result);
        });
      }

      this.log(`Retrieved ${Object.keys(flags).length} flags from ${providerName}`);
      return flags;
    } catch (error) {
      this.handleError(providerName, error);
      return {};
    }
  }

  async isEnabled(key: string, options?: FlagEvaluationOptions): Promise<boolean> {
    try {
      const result = await this.getFlag(key, false, options);
      return Boolean(result.value);
    } catch (error) {
      this.log(`Error evaluating flag ${key}, returning false:`, error);
      return false;
    }
  }

  async getVariant(
    key: string,
    options?: FlagEvaluationOptions,
  ): Promise<{ variant: string; payload?: any } | null> {
    const providerName = options?.provider || this.primaryProvider;
    const provider = this.providers.get(providerName || '');

    if (!provider || !provider.getVariant) {
      return null;
    }

    const context = { ...this.globalContext, ...options?.context };

    try {
      return await provider.getVariant(key, context);
    } catch (error) {
      this.handleError(providerName || '', error, key);
      return null;
    }
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  setContext(context: FlagContext): void {
    this.globalContext = { ...context };

    // Update all providers
    this.providers.forEach((provider) => {
      provider.setContext(this.globalContext);
    });

    // Clear cache when context changes
    if (this.cache) {
      this.cache.clear();
    }

    this.log('Global context updated:', this.globalContext);
  }

  updateContext(updates: Partial<FlagContext>): void {
    this.globalContext = { ...this.globalContext, ...updates };

    // Update all providers
    this.providers.forEach((provider) => {
      provider.updateContext(updates);
    });

    // Clear cache when context changes
    if (this.cache) {
      this.cache.clear();
    }

    this.log('Global context updated with:', updates);
  }

  getContext(): FlagContext {
    return { ...this.globalContext };
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const initPromises = Array.from(this.providers.values()).map((provider) =>
      provider.initialize(this.globalContext),
    );

    await Promise.allSettled(initPromises);
    this.isInitialized = true;
    this.log('Feature flag manager initialized');
  }

  async close(): Promise<void> {
    const closePromises = Array.from(this.providers.values()).map((provider) => provider.close());

    await Promise.allSettled(closePromises);
    this.providers.clear();
    this.metrics.clear();
    this.cache?.clear();
    this.isInitialized = false;
    this.log('Feature flag manager closed');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getMetrics(): Record<string, FlagMetrics> {
    const result: Record<string, FlagMetrics> = {};
    this.metrics.forEach((metrics, provider) => {
      result[provider] = { ...metrics };
    });
    return result;
  }

  clearCache(): void {
    this.cache?.clear();
    this.log('Cache cleared');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async createProvider(config: FlagConfig): Promise<FeatureFlagProvider> {
    // Provider factory - would be implemented with actual providers
    switch (config.provider.toLowerCase()) {
      case 'posthog':
        const { PostHogFlagProvider } = await import('../providers/posthog-flags');
        return new PostHogFlagProvider(config);

      // Additional providers can be added here when implemented
      // case 'launchdarkly':
      //   const { LaunchDarklyFlagProvider } = await import('../providers/launchdarkly-flags');
      //   return new LaunchDarklyFlagProvider(config);
      //
      // case 'flagsmith':
      //   const { FlagsmithFlagProvider } = await import('../providers/flagsmith-flags');
      //   return new FlagsmithFlagProvider(config);
      //
      // case 'split':
      //   const { SplitFlagProvider } = await import('../providers/split-flags');
      //   return new SplitFlagProvider(config);

      case 'local':
        const { LocalFlagProvider } = await import('../providers/local-flags');
        return new LocalFlagProvider(config);

      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  private getFallbackValue<T>(
    key: string,
    defaultValue: T,
    options?: FlagEvaluationOptions,
    providerName?: string,
  ): FlagEvaluationResult<T> {
    const strategy = options?.fallbackStrategy || 'default';

    switch (strategy) {
      case 'cache': {
        if (this.cache) {
          const cached = this.cache.get(`${providerName}:${key}`);
          if (cached) {
            this.log(`Using cached fallback for flag ${key}`);
            return { ...cached, source: 'cache' } as FlagEvaluationResult<T>;
          }
        }
        break;
      }

      case 'last_known': {
        // Could implement persistent storage lookup
        break;
      }
    }

    // Default fallback
    return {
      key,
      reason: 'error',
      source: 'fallback',
      timestamp: Date.now(),
      value: defaultValue,
    };
  }

  private isCacheValid(cached: FlagEvaluationResult): boolean {
    // Simple TTL check - could be enhanced with more sophisticated logic
    const TTL = 5 * 60 * 1000; // 5 minutes
    return Date.now() - cached.timestamp < TTL;
  }

  private updateMetrics(provider: string, startTime: number, cacheHit: boolean): void {
    const metrics = this.metrics.get(provider);
    if (!metrics) return;

    const responseTime = performance.now() - startTime;

    metrics.evaluations++;
    metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
    metrics.lastEvaluation = Date.now();

    if (cacheHit) {
      metrics.cacheHits++;
    } else {
      metrics.cacheMisses++;
    }
  }

  private handleError(provider: string, error: any, flagKey?: string): void {
    const metrics = this.metrics.get(provider);
    if (metrics) {
      metrics.errors++;
    }

    this.log(`Error in provider ${provider}${flagKey ? ` for flag ${flagKey}` : ''}:`, error);
  }

  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[FeatureFlags]', ...args);
    }
  }
}

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

export class MemoryFlagCache implements FlagCache {
  private cache = new Map<string, { data: FlagEvaluationResult; expires: number }>();
  private defaultTTL: number;

  constructor(config: CacheConfig) {
    this.defaultTTL = config.ttl;
  }

  get(key: string): FlagEvaluationResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, result: FlagEvaluationResult, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data: result, expires });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}
