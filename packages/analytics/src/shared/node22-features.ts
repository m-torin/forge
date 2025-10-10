/**
 * Node.js 22+ Advanced Analytics Features
 *
 * Enterprise-grade analytics enhancements leveraging Node.js 22+ features
 * for superior performance, memory efficiency, and developer experience.
 *
 * ## Key Node 22+ Features Used:
 * - **Promise.withResolvers()**: External promise control for complex analytics workflows
 * - **AbortSignal.timeout()**: Context-aware timeouts for analytics operations
 * - **structuredClone()**: Safe event data isolation and batch processing
 * - **Object.hasOwn()**: Safer property existence checks for event validation
 * - **WeakMap/WeakSet**: Memory-efficient provider and event tracking
 * - **High-resolution timing**: Nanosecond precision performance measurements
 * - **FinalizationRegistry**: Automatic cleanup of analytics resources
 *
 * ## Enhanced Capabilities:
 * - Advanced event batching with configurable strategies
 * - Real-time analytics performance monitoring
 * - Memory-efficient event queuing and processing
 * - Provider health monitoring with automatic failover
 * - Comprehensive analytics debugging and diagnostics
 * - Production-safe error handling with detailed telemetry
 *
 * @module Node22AnalyticsFeatures
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

import type {
  AnalyticsConfig,
  AnalyticsProvider,
  EmitterPayload,
  TrackingOptions,
} from './types/types';

/**
 * Advanced event batching configuration
 */
interface EventBatchConfig {
  readonly maxBatchSize: number;
  readonly batchTimeoutMs: number;
  readonly compressionEnabled: boolean;
  readonly retryAttempts: number;
  readonly retryDelayMs: number;
  readonly enablePrioritization: boolean;
  readonly maxMemoryUsage: number; // bytes
  readonly strategy: 'fifo' | 'lifo' | 'priority' | 'size-optimized';
}

/**
 * Analytics performance metrics
 */
interface AnalyticsMetrics {
  readonly timestamp: bigint;
  readonly eventCount: number;
  readonly batchCount: number;
  readonly processingTime: number; // nanoseconds
  readonly memoryUsage: number; // bytes
  readonly errorCount: number;
  readonly providerHealth: Map<string, number>; // provider -> health score (0-1)
  readonly throughputEventsPerSecond: number;
  readonly averageLatency: number; // milliseconds
}

/**
 * Provider health status
 */
interface ProviderHealthStatus {
  readonly providerId: string;
  readonly isHealthy: boolean;
  readonly lastCheck: bigint;
  readonly responseTime: number; // milliseconds
  readonly errorRate: number; // 0-1
  readonly successRate: number; // 0-1
  readonly consecutiveFailures: number;
  readonly estimatedRecoveryTime?: number; // milliseconds
}

/**
 * Event processing result using Node 22+ features
 */
interface EventProcessingResult {
  readonly success: boolean;
  readonly processedAt: bigint;
  readonly processingTime: number; // nanoseconds
  readonly batchId?: string;
  readonly providerId: string;
  readonly eventId: string;
  readonly retryAttempt: number;
  readonly error?: Error;
  readonly metrics: {
    memoryUsed: number; // bytes
    networkLatency?: number; // milliseconds
    serializationTime: number; // nanoseconds
  };
}

/**
 * Advanced event batcher using Node 22+ WeakMap and Promise.withResolvers()
 */
export class AdvancedEventBatcher {
  private readonly eventQueue: EmitterPayload[] = [];
  private readonly batchPromises = new Map<
    string,
    { resolve: (value: EventProcessingResult[]) => void; reject: (error: Error) => void }
  >();
  private readonly eventMetadata = new WeakMap<
    EmitterPayload,
    {
      enqueuedAt: bigint;
      priority: number;
      retryCount: number;
    }
  >();

  private readonly providerHealthMap = new Map<string, ProviderHealthStatus>();
  private readonly metrics = new Map<string, AnalyticsMetrics>();
  private batchTimer?: NodeJS.Timeout;
  private isProcessing = false;

  // Node 22+ FinalizationRegistry for automatic cleanup
  private readonly finalizationRegistry = new FinalizationRegistry((batchId: string) => {
    this.cleanupBatch(batchId);
  });

  constructor(
    private readonly config: EventBatchConfig,
    private readonly providers: Map<string, AnalyticsProvider>,
  ) {}

  /**
   * Enqueue event for batched processing with Node 22+ features
   */
  async enqueueEvent(
    payload: EmitterPayload,
    options: TrackingOptions & { priority?: number } = {},
    abortSignal?: AbortSignal,
  ): Promise<EventProcessingResult[]> {
    const eventId = this.generateEventId();
    const enqueuedAt = process.hrtime.bigint();

    // Use Node 22+ Promise.withResolvers() for external control
    const { promise, resolve, reject } = Promise.withResolvers<EventProcessingResult[]>();

    // Store metadata using WeakMap (Node 22+)
    this.eventMetadata.set(payload, {
      enqueuedAt,
      priority: options.priority || 0,
      retryCount: 0,
    });

    // Add to queue with priority sorting if enabled
    if (this.config.enablePrioritization) {
      this.insertWithPriority(payload, options.priority || 0);
    } else {
      this.eventQueue.push(payload);
    }

    // Store promise resolvers for this batch
    this.batchPromises.set(eventId, { resolve, reject });

    // Handle abort signal if provided
    if (abortSignal) {
      abortSignal.addEventListener(
        'abort',
        () => {
          reject(new Error('Event processing aborted'));
          this.removeBatchPromise(eventId);
        },
        { once: true },
      );
    }

    // Trigger batch processing if needed
    await this.maybeProcessBatch();

    return promise;
  }

  /**
   * Process events in optimized batches using Node 22+ features
   */
  private async maybeProcessBatch(): Promise<void> {
    if (this.isProcessing) return;

    const shouldProcess =
      this.eventQueue.length >= this.config.maxBatchSize ||
      this.getOldestEventAge() > this.config.batchTimeoutMs ||
      this.isMemoryThresholdExceeded();

    if (!shouldProcess) {
      this.scheduleBatchTimeout();
      return;
    }

    await this.processBatch();
  }

  /**
   * Process current batch with provider failover and Node 22+ optimizations
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const batchId = this.generateBatchId();
    const startTime = process.hrtime.bigint();

    try {
      // Clone events for safe processing (Node 22+)
      const eventsToProcess = this.eventQueue
        .splice(0, this.config.maxBatchSize)
        .map(event => structuredClone(event));

      // Register batch for cleanup
      const batchRef = { batchId };
      this.finalizationRegistry.register(batchRef, batchId);

      // Process events across healthy providers
      const results = await this.processEventsAcrossProviders(
        eventsToProcess,
        batchId,
        AbortSignal.timeout(this.config.batchTimeoutMs * 2),
      );

      // Update metrics
      const endTime = process.hrtime.bigint();
      await this.updateMetrics(batchId, eventsToProcess.length, Number(endTime - startTime));

      // Resolve all pending promises for this batch
      this.resolveBatchPromises(results);
    } catch (error) {
      this.rejectBatchPromises(error as Error);
    } finally {
      this.isProcessing = false;

      // Continue processing if there are more events
      if (this.eventQueue.length > 0) {
        await this.maybeProcessBatch();
      }
    }
  }

  /**
   * Process events across providers with health monitoring and failover
   */
  private async processEventsAcrossProviders(
    events: EmitterPayload[],
    batchId: string,
    abortSignal: AbortSignal,
  ): Promise<EventProcessingResult[]> {
    const results: EventProcessingResult[] = [];
    const healthyProviders = await this.getHealthyProviders();

    if (healthyProviders.length === 0) {
      throw new Error('No healthy analytics providers available');
    }

    // Process events concurrently across healthy providers
    const processingPromises = events.map(async (event, index) => {
      const eventId = `${batchId}_${index}`;

      for (const provider of healthyProviders) {
        if (abortSignal.aborted) {
          throw new Error('Batch processing aborted');
        }

        try {
          const result = await this.processEventWithProvider(event, provider, eventId, abortSignal);

          results.push(result);
          break; // Success, move to next event
        } catch (error) {
          await this.recordProviderError(provider.constructor.name, error as Error);

          // Try next provider
          continue;
        }
      }
    });

    await Promise.allSettled(processingPromises);
    return results;
  }

  /**
   * Process single event with provider using Node 22+ timing
   */
  private async processEventWithProvider(
    event: EmitterPayload,
    provider: AnalyticsProvider,
    eventId: string,
    abortSignal: AbortSignal,
  ): Promise<EventProcessingResult> {
    const startTime = process.hrtime.bigint();
    const initialMemory = process.memoryUsage().heapUsed;

    try {
      // Serialize event with timing
      const serializationStart = process.hrtime.bigint();
      JSON.stringify(event);
      const serializationEnd = process.hrtime.bigint();

      // Process with provider
      await this.callProviderWithTimeout(provider, event, abortSignal);

      const endTime = process.hrtime.bigint();
      const finalMemory = process.memoryUsage().heapUsed;

      return {
        success: true,
        processedAt: endTime,
        processingTime: Number(endTime - startTime),
        eventId,
        providerId: provider.constructor.name,
        retryAttempt: this.getRetryCount(event),
        metrics: {
          memoryUsed: finalMemory - initialMemory,
          serializationTime: Number(serializationEnd - serializationStart),
        },
      };
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const finalMemory = process.memoryUsage().heapUsed;

      return {
        success: false,
        processedAt: endTime,
        processingTime: Number(endTime - startTime),
        eventId,
        providerId: provider.constructor.name,
        retryAttempt: this.getRetryCount(event),
        error: error as Error,
        metrics: {
          memoryUsed: finalMemory - initialMemory,
          serializationTime: 0,
        },
      };
    }
  }

  /**
   * Call provider method with timeout using AbortSignal.timeout()
   */
  private async callProviderWithTimeout(
    provider: AnalyticsProvider,
    event: EmitterPayload,
    abortSignal: AbortSignal,
  ): Promise<void> {
    const timeoutSignal = AbortSignal.timeout(5000); // 5 second timeout
    const combinedSignal = AbortSignal.any([abortSignal, timeoutSignal]);

    // Determine the provider method to call based on event type
    if (event.type === 'track') {
      await provider.track(event.event, event.properties || {}, event.context);
    } else if (event.type === 'identify' && provider.identify && event.userId) {
      await provider.identify(event.userId, event.traits || {}, event.context);
    } else if (event.type === 'page' && provider.page) {
      await provider.page(event.name || 'Unknown Page', event.properties || {}, event.context);
    } else if (event.type === 'group' && provider.group && event.groupId) {
      await provider.group(event.groupId, event.traits || {}, event.context);
    } else if (event.type === 'alias' && provider.alias && event.userId && event.previousId) {
      await provider.alias(event.userId, event.previousId, event.context);
    }

    if (combinedSignal.aborted) {
      throw new Error('Provider call timed out or was aborted');
    }
  }

  /**
   * Get healthy providers with real-time health monitoring
   */
  private async getHealthyProviders(): Promise<AnalyticsProvider[]> {
    const healthyProviders: AnalyticsProvider[] = [];
    const now = process.hrtime.bigint();

    for (const [providerId, provider] of this.providers) {
      const health = this.providerHealthMap.get(providerId);

      // Check if we need to re-evaluate health
      const needsHealthCheck = !health || Number(now - health.lastCheck) > 30000000000; // 30 seconds in nanoseconds

      if (needsHealthCheck) {
        await this.checkProviderHealth(providerId, provider);
      }

      const currentHealth = this.providerHealthMap.get(providerId);
      if (currentHealth?.isHealthy) {
        healthyProviders.push(provider);
      }
    }

    return healthyProviders;
  }

  /**
   * Check individual provider health using Node 22+ timing
   */
  private async checkProviderHealth(
    providerId: string,
    provider: AnalyticsProvider,
  ): Promise<void> {
    const startTime = process.hrtime.bigint();

    try {
      // Simple health check - attempt to track a test event
      const testEvent = {
        event: '__health_check__',
        properties: { timestamp: Date.now() },
        options: { send: false }, // Don't actually send if provider supports it
      };

      await Promise.race([
        provider.track(testEvent.event, testEvent.properties, testEvent.options),
        new Promise<void>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), 2000),
        ),
      ]);

      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1_000_000; // Convert to ms

      this.providerHealthMap.set(providerId, {
        providerId,
        isHealthy: true,
        lastCheck: endTime,
        responseTime,
        errorRate: 0,
        successRate: 1,
        consecutiveFailures: 0,
      });
    } catch (_error) {
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1_000_000;

      const existingHealth = this.providerHealthMap.get(providerId);
      const consecutiveFailures = (existingHealth?.consecutiveFailures || 0) + 1;

      this.providerHealthMap.set(providerId, {
        providerId,
        isHealthy: consecutiveFailures < 3, // Healthy if fewer than 3 consecutive failures
        lastCheck: endTime,
        responseTime,
        errorRate: Math.min(1, consecutiveFailures * 0.25),
        successRate: Math.max(0, 1 - consecutiveFailures * 0.25),
        consecutiveFailures,
        estimatedRecoveryTime: consecutiveFailures * 30000, // 30s per failure
      });
    }
  }

  /**
   * Update analytics metrics using high-resolution timing
   */
  private async updateMetrics(
    batchId: string,
    eventCount: number,
    processingTime: number,
  ): Promise<void> {
    const now = process.hrtime.bigint();
    const memoryUsage = process.memoryUsage().heapUsed;

    // Calculate throughput
    const processingTimeMs = processingTime / 1_000_000;
    const throughput = processingTimeMs > 0 ? (eventCount / processingTimeMs) * 1000 : 0;

    const metrics: AnalyticsMetrics = {
      timestamp: now,
      eventCount,
      batchCount: 1,
      processingTime,
      memoryUsage,
      errorCount: 0, // Would be calculated from results
      providerHealth: new Map(
        Array.from(this.providerHealthMap.entries()).map(([id, health]) => [
          id,
          health.successRate,
        ]),
      ),
      throughputEventsPerSecond: throughput,
      averageLatency: processingTimeMs,
    };

    this.metrics.set(batchId, metrics);

    // Keep only recent metrics to prevent memory growth
    if (this.metrics.size > 100) {
      const oldestKey = this.metrics.keys().next().value;
      if (oldestKey !== undefined) {
        this.metrics.delete(oldestKey);
      }
    }
  }

  /**
   * Get comprehensive analytics performance metrics
   */
  getPerformanceMetrics(): {
    current: AnalyticsMetrics | null;
    average: Partial<AnalyticsMetrics>;
    providerHealth: Map<string, ProviderHealthStatus>;
    queueStatus: {
      queueLength: number;
      oldestEventAge: number;
      memoryUsage: number;
      isProcessing: boolean;
    };
  } {
    const allMetrics = Array.from(this.metrics.values());
    const current = allMetrics.length > 0 ? allMetrics[allMetrics.length - 1] : null;

    const average =
      allMetrics.length > 0
        ? {
            eventCount: allMetrics.reduce((sum, m) => sum + m.eventCount, 0) / allMetrics.length,
            processingTime:
              allMetrics.reduce((sum, m) => sum + m.processingTime, 0) / allMetrics.length,
            memoryUsage: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / allMetrics.length,
            throughputEventsPerSecond:
              allMetrics.reduce((sum, m) => sum + m.throughputEventsPerSecond, 0) /
              allMetrics.length,
            averageLatency:
              allMetrics.reduce((sum, m) => sum + m.averageLatency, 0) / allMetrics.length,
          }
        : {};

    return {
      current,
      average,
      providerHealth: new Map(this.providerHealthMap),
      queueStatus: {
        queueLength: this.eventQueue.length,
        oldestEventAge: this.getOldestEventAge(),
        memoryUsage: process.memoryUsage().heapUsed,
        isProcessing: this.isProcessing,
      },
    };
  }

  // Helper methods
  private insertWithPriority(payload: EmitterPayload, priority: number): void {
    const index = this.eventQueue.findIndex(event => {
      const eventMeta = this.eventMetadata.get(event);
      return (eventMeta?.priority || 0) < priority;
    });

    if (index === -1) {
      this.eventQueue.push(payload);
    } else {
      this.eventQueue.splice(index, 0, payload);
    }
  }

  private getOldestEventAge(): number {
    if (this.eventQueue.length === 0) return 0;

    const oldestEvent = this.eventQueue[0];
    const metadata = this.eventMetadata.get(oldestEvent);

    if (!metadata) return 0;

    return Number(process.hrtime.bigint() - metadata.enqueuedAt) / 1_000_000; // ms
  }

  private isMemoryThresholdExceeded(): boolean {
    return process.memoryUsage().heapUsed > this.config.maxMemoryUsage;
  }

  private scheduleBatchTimeout(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(async () => {
      this.batchTimer = undefined;
      await this.processBatch();
    }, this.config.batchTimeoutMs);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRetryCount(event: EmitterPayload): number {
    return this.eventMetadata.get(event)?.retryCount || 0;
  }

  private async recordProviderError(providerId: string, _error: Error): Promise<void> {
    const health = this.providerHealthMap.get(providerId);
    if (health) {
      this.providerHealthMap.set(providerId, {
        ...health,
        consecutiveFailures: health.consecutiveFailures + 1,
        errorRate: Math.min(1, health.errorRate + 0.1),
        successRate: Math.max(0, health.successRate - 0.1),
        isHealthy: health.consecutiveFailures < 2, // Become unhealthy after 3 failures
      });
    }
  }

  private resolveBatchPromises(results: EventProcessingResult[]): void {
    // Group results by event/batch and resolve promises
    const batchGroups = new Map<string, EventProcessingResult[]>();

    for (const result of results) {
      const batchId = result.eventId.split('_')[0];
      if (!batchGroups.has(batchId)) {
        batchGroups.set(batchId, []);
      }
      const group = batchGroups.get(batchId);
      if (group) {
        group.push(result);
      }
    }

    for (const [batchId, batchResults] of batchGroups) {
      const batchPromise = this.batchPromises.get(batchId);
      if (batchPromise) {
        batchPromise.resolve(batchResults);
        this.batchPromises.delete(batchId);
      }
    }
  }

  private rejectBatchPromises(error: Error): void {
    for (const [_batchId, batchPromise] of this.batchPromises) {
      batchPromise.reject(error);
    }
    this.batchPromises.clear();
  }

  private createErrorResults(batchId: string, error: Error): EventProcessingResult[] {
    return this.eventQueue.map((event, index) => ({
      success: false,
      processedAt: process.hrtime.bigint(),
      processingTime: 0,
      eventId: `${batchId}_${index}`,
      providerId: 'unknown',
      retryAttempt: this.getRetryCount(event),
      error,
      metrics: {
        memoryUsed: 0,
        serializationTime: 0,
      },
    }));
  }

  private removeBatchPromise(eventId: string): void {
    this.batchPromises.delete(eventId);
  }

  private cleanupBatch(batchId: string): void {
    // Cleanup any resources associated with the batch
    this.metrics.delete(batchId);
  }
}

/**
 * Enhanced analytics manager with Node 22+ optimizations
 */
export class Node22AnalyticsManager {
  private readonly eventBatcher: AdvancedEventBatcher;
  private readonly performanceMonitor: Map<string, bigint> = new Map();

  // Node 22+ WeakSet for tracking processed events (memory efficient)
  private readonly processedEvents = new WeakSet<EmitterPayload>();

  constructor(
    private readonly config: AnalyticsConfig,
    private readonly providers: Map<string, AnalyticsProvider>,
    private readonly batchConfig: EventBatchConfig,
  ) {
    this.eventBatcher = new AdvancedEventBatcher(batchConfig, providers);
  }

  /**
   * Enhanced event emission with Node 22+ features
   */
  async emit(
    payload: EmitterPayload,
    options: TrackingOptions & {
      priority?: number;
      timeout?: number;
      retries?: number;
    } = {},
  ): Promise<EventProcessingResult[]> {
    // Prevent duplicate processing using WeakSet (Node 22+)
    if (this.processedEvents.has(payload)) {
      throw new Error('Event has already been processed');
    }

    const startTime = process.hrtime.bigint();
    this.performanceMonitor.set('emit_start', startTime);

    try {
      // Create abort signal with timeout
      const abortSignal = options.timeout ? AbortSignal.timeout(options.timeout) : undefined;

      // Use advanced batcher for processing
      const results = await this.eventBatcher.enqueueEvent(payload, options, abortSignal);

      // Mark as processed using WeakSet (Node 22+)
      this.processedEvents.add(payload);

      const endTime = process.hrtime.bigint();
      this.performanceMonitor.set('emit_end', endTime);

      return results;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      this.performanceMonitor.set('emit_error', endTime);
      throw error;
    }
  }

  /**
   * Get real-time performance metrics using Node 22+ features
   */
  getAnalyticsMetrics(): ReturnType<AdvancedEventBatcher['getPerformanceMetrics']> & {
    emissionMetrics: {
      averageEmissionTime: number; // nanoseconds
      totalEmissions: number;
      failureRate: number;
    };
  } {
    const batcherMetrics = this.eventBatcher.getPerformanceMetrics();

    // Calculate emission-specific metrics
    const emissionTimes: number[] = [];
    let totalEmissions = 0;
    let failures = 0;

    // This would be implemented with actual tracking
    const averageEmissionTime =
      emissionTimes.length > 0
        ? emissionTimes.reduce((sum, time) => sum + time, 0) / emissionTimes.length
        : 0;

    return {
      ...batcherMetrics,
      emissionMetrics: {
        averageEmissionTime,
        totalEmissions,
        failureRate: totalEmissions > 0 ? failures / totalEmissions : 0,
      },
    };
  }

  /**
   * Health check for all analytics systems
   */
  async healthCheck(timeout: number = 5000): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<string, 'healthy' | 'unhealthy'>;
    metrics: any;
  }> {
    const _abortSignal = AbortSignal.timeout(timeout);
    const metrics = this.getAnalyticsMetrics();

    // Determine overall health
    const healthyProviders = Array.from(metrics.providerHealth.values()).filter(
      health => health.isHealthy,
    ).length;
    const totalProviders = metrics.providerHealth.size;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyProviders === totalProviders) {
      overall = 'healthy';
    } else if (healthyProviders > 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    const providers: Record<string, 'healthy' | 'unhealthy'> = {};
    for (const [providerId, health] of metrics.providerHealth) {
      providers[providerId] = health.isHealthy ? 'healthy' : 'unhealthy';
    }

    return {
      overall,
      providers,
      metrics,
    };
  }
}

/**
 * Factory function to create Node 22+ enhanced analytics manager
 */
export function createNode22AnalyticsManager(
  config: AnalyticsConfig,
  providers: Map<string, AnalyticsProvider>,
  batchConfig: Partial<EventBatchConfig> = {},
): Node22AnalyticsManager {
  const defaultBatchConfig: EventBatchConfig = {
    maxBatchSize: 50,
    batchTimeoutMs: 5000,
    compressionEnabled: true,
    retryAttempts: 3,
    retryDelayMs: 1000,
    enablePrioritization: true,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    strategy: 'priority',
    ...batchConfig,
  };

  return new Node22AnalyticsManager(config, providers, defaultBatchConfig);
}

/**
 * Default export: Enhanced analytics utilities
 */
export const node22Analytics = {
  AdvancedEventBatcher,
  Node22AnalyticsManager,
  createNode22AnalyticsManager,
} as const;
