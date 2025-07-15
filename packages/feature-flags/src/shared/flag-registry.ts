import { logInfo } from '@repo/observability';
import type { UnifiedContext } from './createVercelFlag';

// Flag definition registry for management operations
interface FlagDefinition<T = any> {
  key: string;
  description?: string;
  type: 'boolean' | 'variant' | 'custom';
  flagFunction: () => Promise<T>;
  metadata: {
    adapters: string[];
    fallbackType: string;
    createdAt: Date;
    lastEvaluated?: Date;
    evaluationCount: number;
  };
}

class FlagManager {
  private registry = new Map<string, FlagDefinition>();
  private evaluationMetrics = new Map<
    string,
    {
      count: number;
      lastEvaluated: Date;
      averageLatency: number;
      failureCount: number;
      fallbackUsage: number;
    }
  >();

  /**
   * Register a flag for management and monitoring
   */
  register<T>(
    key: string,
    flagFunction: () => Promise<T>,
    options: {
      description?: string;
      type?: 'boolean' | 'variant' | 'custom';
      adapters?: string[];
      fallbackType?: string;
    } = {},
  ): void {
    const definition: FlagDefinition<T> = {
      key,
      description: options.description,
      type: options.type || 'boolean',
      flagFunction,
      metadata: {
        adapters: options.adapters || [],
        fallbackType: options.fallbackType || 'unknown',
        createdAt: new Date(),
        evaluationCount: 0,
      },
    };

    this.registry.set(key, definition);
    this.evaluationMetrics.set(key, {
      count: 0,
      lastEvaluated: new Date(),
      averageLatency: 0,
      failureCount: 0,
      fallbackUsage: 0,
    });

    logInfo('Flag registered', { key, type: definition.type });
  }

  /**
   * Evaluate multiple flags in parallel with performance tracking
   */
  async evaluateFlags<T extends Record<string, () => Promise<any>>>(
    flags: T,
    options: {
      timeout?: number;
      failFast?: boolean;
      trackMetrics?: boolean;
    } = {},
  ): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
    const { timeout = 5000, failFast = false, trackMetrics = true } = options;
    const startTime = Date.now();

    const evaluateWithTimeout = async <U>(
      key: string,
      flagFn: () => Promise<U>,
    ): Promise<{ key: string; result: U; error?: Error; latency: number }> => {
      const flagStartTime = Date.now();

      try {
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
          setTimeout(() => reject(new Error(`Flag evaluation timeout: ${key}`)), timeout);
        });

        const result = await Promise.race([flagFn(), timeoutPromise]);
        const latency = Date.now() - flagStartTime;

        if (trackMetrics) {
          this.updateMetrics(key, latency, false);
        }

        return { key, result, latency };
      } catch (error) {
        const latency = Date.now() - flagStartTime;

        if (trackMetrics) {
          this.updateMetrics(key, latency, true);
        }

        if (failFast) {
          throw error;
        }

        return {
          key,
          result: undefined as U,
          error: error instanceof Error ? error : new Error(String(error)),
          latency,
        };
      }
    };

    const promises = Object.entries(flags).map(([key, flagFn]) => evaluateWithTimeout(key, flagFn));

    const results = await Promise.all(promises);
    const totalLatency = Date.now() - startTime;

    // Log performance metrics
    if (trackMetrics) {
      const errors = results.filter(r => r.error);
      const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;

      logInfo('Batch flag evaluation completed', {
        flagCount: results.length,
        totalLatency,
        averageLatency: avgLatency,
        errorCount: errors.length,
        errors: errors.map(e => ({ key: e.key, error: e.error?.message })),
      });
    }

    // Convert results back to expected format
    const finalResults = {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
    for (const result of results) {
      (finalResults as any)[result.key] = result.result;
    }

    return finalResults;
  }

  /**
   * Get flag registry information
   */
  getRegisteredFlags(): Array<{
    key: string;
    description?: string;
    type: string;
    adapters: string[];
    fallbackType: string;
    createdAt: Date;
    evaluationCount: number;
    lastEvaluated?: Date;
  }> {
    return Array.from(this.registry.values()).map(def => ({
      key: def.key,
      description: def.description,
      type: def.type,
      adapters: def.metadata.adapters,
      fallbackType: def.metadata.fallbackType,
      createdAt: def.metadata.createdAt,
      evaluationCount: def.metadata.evaluationCount,
      lastEvaluated: def.metadata.lastEvaluated,
    }));
  }

  /**
   * Get performance metrics for all flags
   */
  getMetrics(): Array<{
    key: string;
    count: number;
    lastEvaluated: Date;
    averageLatency: number;
    failureRate: number;
    fallbackRate: number;
  }> {
    return Array.from(this.evaluationMetrics.entries()).map(([key, metrics]) => ({
      key,
      count: metrics.count,
      lastEvaluated: metrics.lastEvaluated,
      averageLatency: metrics.averageLatency,
      failureRate: metrics.count > 0 ? metrics.failureCount / metrics.count : 0,
      fallbackRate: metrics.count > 0 ? metrics.fallbackUsage / metrics.count : 0,
    }));
  }

  /**
   * Test all registered flags with mock context
   */
  async testFlags(mockContext?: Partial<UnifiedContext>): Promise<
    Array<{
      key: string;
      result: any;
      error?: string;
      latency: number;
      usedFallback: boolean;
    }>
  > {
    const testResults: Array<{
      key: string;
      result: any;
      error?: string;
      latency: number;
      usedFallback: boolean;
    }> = [];

    for (const [key, definition] of this.registry.entries()) {
      const startTime = Date.now();

      try {
        // Create mock context for testing
        const _testContext = {
          user: { id: 'test-user', tier: 'pro', sessionId: 'test-session' },
          visitor: { id: 'test-visitor' },
          request: {
            country: 'US',
            userAgent: 'test-agent',
            environment: 'test',
            deployment: 'test-deployment',
          },
          timestamp: Date.now(),
          ...mockContext,
        };

        // This would need to be extended to actually pass context to the flag
        const result = await definition.flagFunction();
        const latency = Date.now() - startTime;

        testResults.push({
          key,
          result,
          latency,
          usedFallback: false, // Would need actual adapter chain info
        });
      } catch (error) {
        const latency = Date.now() - startTime;

        testResults.push({
          key,
          result: null,
          error: error instanceof Error ? error.message : String(error),
          latency,
          usedFallback: true,
        });
      }
    }

    return testResults;
  }

  /**
   * Force refresh all external adapters (useful for cache invalidation)
   */
  async refreshAdapters(): Promise<void> {
    logInfo('Refreshing all flag adapters');

    // This would trigger refresh on PostHog, Edge Config, etc.
    // Implementation depends on adapter capabilities

    for (const [key] of this.registry.entries()) {
      const metrics = this.evaluationMetrics.get(key);
      if (metrics) {
        metrics.count = 0;
        metrics.failureCount = 0;
        metrics.fallbackUsage = 0;
      }
    }
  }

  /**
   * Generate flag usage report
   */
  generateReport(): {
    totalFlags: number;
    totalEvaluations: number;
    averageLatency: number;
    overallFailureRate: number;
    flagDetails: Array<{
      key: string;
      description?: string;
      evaluations: number;
      failureRate: number;
      avgLatency: number;
      status: 'healthy' | 'warning' | 'error';
    }>;
  } {
    const flags = this.getRegisteredFlags();
    const metrics = this.getMetrics();

    const totalEvaluations = metrics.reduce((sum, m) => sum + m.count, 0);
    const totalFailures = metrics.reduce((sum, m) => sum + m.count * m.failureRate, 0);
    const totalLatency = metrics.reduce((sum, m) => sum + m.averageLatency * m.count, 0);

    const flagDetails = flags.map(flag => {
      const metric = metrics.find(m => m.key === flag.key);
      const failureRate = metric?.failureRate || 0;
      const avgLatency = metric?.averageLatency || 0;

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      if (failureRate > 0.1) status = 'error';
      else if (failureRate > 0.05 || avgLatency > 100) status = 'warning';

      return {
        key: flag.key,
        description: flag.description,
        evaluations: metric?.count || 0,
        failureRate,
        avgLatency,
        status,
      };
    });

    return {
      totalFlags: flags.length,
      totalEvaluations,
      averageLatency: totalEvaluations > 0 ? totalLatency / totalEvaluations : 0,
      overallFailureRate: totalEvaluations > 0 ? totalFailures / totalEvaluations : 0,
      flagDetails,
    };
  }

  private updateMetrics(key: string, latency: number, failed: boolean): void {
    const metrics = this.evaluationMetrics.get(key);
    if (!metrics) return;

    metrics.count++;
    metrics.lastEvaluated = new Date();
    metrics.averageLatency =
      (metrics.averageLatency * (metrics.count - 1) + latency) / metrics.count;

    if (failed) {
      metrics.failureCount++;
    }

    // Update registry metadata
    const definition = this.registry.get(key);
    if (definition) {
      definition.metadata.evaluationCount++;
      definition.metadata.lastEvaluated = new Date();
    }
  }
}

// Singleton instance
export const flagManager = new FlagManager();

/**
 * Utility function to register and create a managed flag
 */
export function createManagedFlag<T>(
  key: string,
  flagFunction: () => Promise<T>,
  options: {
    description?: string;
    type?: 'boolean' | 'variant' | 'custom';
    adapters?: string[];
    fallbackType?: string;
  } = {},
): () => Promise<T> {
  flagManager.register(key, flagFunction, options);
  return flagFunction;
}

/**
 * Batch evaluate multiple flags with performance tracking
 */
export async function evaluateFlags<T extends Record<string, () => Promise<any>>>(
  flags: T,
  options?: {
    timeout?: number;
    failFast?: boolean;
    trackMetrics?: boolean;
  },
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  return flagManager.evaluateFlags(flags, options);
}

/**
 * Get flag performance report
 */
export function getFlagReport() {
  return flagManager.generateReport();
}

/**
 * Test all flags with optional mock context
 */
export function testAllFlags(mockContext?: Partial<UnifiedContext>) {
  return flagManager.testFlags(mockContext);
}
