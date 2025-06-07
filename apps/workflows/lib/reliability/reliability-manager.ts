import { EventEmitter } from 'events';

import {
  type Bulkhead,
  type BulkheadConfig,
  bulkheadRegistry,
  DEFAULT_BULKHEAD_CONFIGS,
} from './bulkhead';
import {
  type CircuitBreaker,
  type CircuitBreakerConfig,
  circuitBreakerRegistry,
  DEFAULT_CIRCUIT_CONFIGS,
} from './circuit-breaker';
import { type RetryConfig, RetryManager } from './retry-manager';

export interface ReliabilityConfig {
  bulkhead?: Partial<BulkheadConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  healthCheck?: {
    enabled: boolean;
    interval: number;
    endpoint?: string;
  };
  name: string;
  retry?: Partial<RetryConfig>;
  timeout?: number;
}

export interface ReliabilityStats {
  avgExecutionTime: number;
  bulkhead?: any;
  circuitBreaker?: any;
  failedExecutions: number;
  lastExecution?: Date;
  name: string;
  successfulExecutions: number;
  totalExecutions: number;
  uptime: number;
}

export class ReliabilityManager extends EventEmitter {
  private configs = new Map<string, ReliabilityConfig>();
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private bulkheads = new Map<string, Bulkhead>();
  private stats = new Map<
    string,
    {
      totalExecutions: number;
      successfulExecutions: number;
      failedExecutions: number;
      totalExecutionTime: number;
      lastExecution?: Date;
    }
  >();

  private healthCheckIntervals = new Map<string, NodeJS.Timeout>();

  constructor() {
    super();
    this.setupDefaultConfigurations();
  }

  private setupDefaultConfigurations(): void {
    // Set up default reliability patterns for common scenarios
    this.registerPattern('http-service', {
      name: 'http-service',
      bulkhead: DEFAULT_BULKHEAD_CONFIGS.http,
      circuitBreaker: DEFAULT_CIRCUIT_CONFIGS.http,
      healthCheck: {
        enabled: true,
        interval: 60000,
      },
      retry: RetryManager.strategies.standard,
      timeout: 30000,
    });

    this.registerPattern('database', {
      name: 'database',
      bulkhead: DEFAULT_BULKHEAD_CONFIGS.database,
      circuitBreaker: DEFAULT_CIRCUIT_CONFIGS.database,
      healthCheck: {
        enabled: true,
        interval: 30000,
      },
      retry: RetryManager.strategies.conservative,
      timeout: 10000,
    });

    this.registerPattern('external-api', {
      name: 'external-api',
      bulkhead: DEFAULT_BULKHEAD_CONFIGS.http,
      circuitBreaker: DEFAULT_CIRCUIT_CONFIGS.external_api,
      healthCheck: {
        enabled: true,
        interval: 120000,
      },
      retry: RetryManager.strategies.aggressive,
      timeout: 45000,
    });

    this.registerPattern('file-system', {
      name: 'file-system',
      bulkhead: DEFAULT_BULKHEAD_CONFIGS.fileSystem,
      retry: RetryManager.strategies.quick,
      timeout: 15000,
    });
  }

  registerPattern(name: string, config: ReliabilityConfig): void {
    this.configs.set(name, config);

    // Create circuit breaker if configured
    if (config.circuitBreaker) {
      const cbConfig: CircuitBreakerConfig = {
        name: `${name}-circuit-breaker`,
        ...DEFAULT_CIRCUIT_CONFIGS.http,
        ...config.circuitBreaker,
      };
      const circuitBreaker = circuitBreakerRegistry.getOrCreate(cbConfig);
      this.circuitBreakers.set(name, circuitBreaker);
    }

    // Create bulkhead if configured
    if (config.bulkhead) {
      const bhConfig: BulkheadConfig = {
        name: `${name}-bulkhead`,
        ...DEFAULT_BULKHEAD_CONFIGS.http,
        ...config.bulkhead,
      };
      const bulkhead = bulkheadRegistry.getOrCreate(bhConfig);
      this.bulkheads.set(name, bulkhead);
    }

    // Initialize stats
    this.stats.set(name, {
      failedExecutions: 0,
      successfulExecutions: 0,
      totalExecutions: 0,
      totalExecutionTime: 0,
    });

    // Start health check if enabled
    if (config.healthCheck?.enabled) {
      this.startHealthCheck(name, config);
    }

    console.log(`Reliability pattern registered: ${name}`);
  }

  async execute<T>(
    patternName: string,
    operation: () => Promise<T>,
    options: {
      timeout?: number;
      context?: Record<string, any>;
    } = {},
  ): Promise<T> {
    const config = this.configs.get(patternName);
    if (!config) {
      throw new Error(`Reliability pattern not found: ${patternName}`);
    }

    const startTime = Date.now();
    const stats = this.stats.get(patternName)!;
    stats.totalExecutions++;

    this.emit('executionStarted', {
      context: options.context,
      patternName,
      timestamp: new Date(),
    });

    try {
      let result: T;

      // Apply timeout if configured
      const timeoutMs = options.timeout || config.timeout;
      const timedOperation = timeoutMs ? () => this.withTimeout(operation, timeoutMs) : operation;

      // Apply patterns in order: Bulkhead -> Circuit Breaker -> Retry
      if (this.bulkheads.has(patternName)) {
        const bulkhead = this.bulkheads.get(patternName)!;
        result = await bulkhead.execute(async () => {
          if (this.circuitBreakers.has(patternName)) {
            const circuitBreaker = this.circuitBreakers.get(patternName)!;
            if (config.retry) {
              const retryResult = await RetryManager.execute(
                () => circuitBreaker.execute(timedOperation),
                {
                  ...config.retry,
                  circuitBreakerName: circuitBreaker.getName(),
                },
              );
              return retryResult.result;
            } else {
              return circuitBreaker.execute(timedOperation);
            }
          } else if (config.retry) {
            const retryResult = await RetryManager.execute(timedOperation, config.retry);
            return retryResult.result;
          } else {
            return timedOperation();
          }
        });
      } else if (this.circuitBreakers.has(patternName)) {
        const circuitBreaker = this.circuitBreakers.get(patternName)!;
        if (config.retry) {
          const retryResult = await RetryManager.execute(
            () => circuitBreaker.execute(timedOperation),
            {
              ...config.retry,
              circuitBreakerName: circuitBreaker.getName(),
            },
          );
          result = retryResult.result;
        } else {
          result = await circuitBreaker.execute(timedOperation);
        }
      } else if (config.retry) {
        const retryResult = await RetryManager.execute(timedOperation, config.retry);
        result = retryResult.result;
      } else {
        result = await timedOperation();
      }

      // Record success
      const executionTime = Date.now() - startTime;
      stats.successfulExecutions++;
      stats.totalExecutionTime += executionTime;
      stats.lastExecution = new Date();

      this.emit('executionCompleted', {
        context: options.context,
        executionTime,
        patternName,
        success: true,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      // Record failure
      const executionTime = Date.now() - startTime;
      stats.failedExecutions++;
      stats.totalExecutionTime += executionTime;
      stats.lastExecution = new Date();

      this.emit('executionCompleted', {
        context: options.context,
        error,
        executionTime,
        patternName,
        success: false,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  private async withTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private startHealthCheck(patternName: string, config: ReliabilityConfig): void {
    if (!config.healthCheck?.enabled || !config.healthCheck.interval) return;

    const interval = setInterval(async () => {
      try {
        await this.performHealthCheck(patternName);
      } catch (error) {
        console.warn(`Health check failed for pattern ${patternName}:`, error);
      }
    }, config.healthCheck.interval);

    this.healthCheckIntervals.set(patternName, interval);
  }

  private async performHealthCheck(patternName: string): Promise<void> {
    const config = this.configs.get(patternName);
    if (!config) return;

    const checks: { name: string; healthy: boolean; details?: any }[] = [];

    // Check circuit breaker
    if (this.circuitBreakers.has(patternName)) {
      const cb = this.circuitBreakers.get(patternName)!;
      checks.push({
        name: 'circuit-breaker',
        details: cb.getStats(),
        healthy: cb.isHealthy(),
      });
    }

    // Check bulkhead
    if (this.bulkheads.has(patternName)) {
      const bulkhead = this.bulkheads.get(patternName)!;
      checks.push({
        name: 'bulkhead',
        details: bulkhead.getStats(),
        healthy: bulkhead.isHealthy(),
      });
    }

    // Check custom endpoint if configured
    if (config.healthCheck?.endpoint) {
      try {
        const response = await fetch(config.healthCheck.endpoint, {
          method: 'GET',
          timeout: 5000,
        } as any);
        checks.push({
          name: 'endpoint',
          details: { status: response.status, statusText: response.statusText },
          healthy: response.ok,
        });
      } catch (error) {
        checks.push({
          name: 'endpoint',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          healthy: false,
        });
      }
    }

    const allHealthy = checks.every((check) => check.healthy);

    this.emit('healthCheck', {
      checks,
      healthy: allHealthy,
      patternName,
      timestamp: new Date(),
    });

    if (!allHealthy) {
      console.warn(
        `Health check failed for pattern ${patternName}:`,
        checks.filter((c) => !c.healthy).map((c) => c.name),
      );
    }
  }

  // Monitoring and stats
  getStats(patternName?: string): ReliabilityStats | Record<string, ReliabilityStats> {
    if (patternName) {
      return this.getPatternStats(patternName);
    }

    const allStats: Record<string, ReliabilityStats> = {};
    for (const name of this.configs.keys()) {
      allStats[name] = this.getPatternStats(name);
    }
    return allStats;
  }

  private getPatternStats(patternName: string): ReliabilityStats {
    const config = this.configs.get(patternName);
    const stats = this.stats.get(patternName);

    if (!config || !stats) {
      throw new Error(`Pattern not found: ${patternName}`);
    }

    const avgExecutionTime =
      stats.totalExecutions > 0 ? stats.totalExecutionTime / stats.totalExecutions : 0;

    const uptime =
      stats.totalExecutions > 0 ? (stats.successfulExecutions / stats.totalExecutions) * 100 : 100;

    const result: ReliabilityStats = {
      name: patternName,
      avgExecutionTime,
      failedExecutions: stats.failedExecutions,
      lastExecution: stats.lastExecution,
      successfulExecutions: stats.successfulExecutions,
      totalExecutions: stats.totalExecutions,
      uptime,
    };

    // Add circuit breaker stats
    if (this.circuitBreakers.has(patternName)) {
      result.circuitBreaker = this.circuitBreakers.get(patternName)!.getStats();
    }

    // Add bulkhead stats
    if (this.bulkheads.has(patternName)) {
      result.bulkhead = this.bulkheads.get(patternName)!.getStats();
    }

    return result;
  }

  // Management operations
  updatePattern(patternName: string, updates: Partial<ReliabilityConfig>): void {
    const existing = this.configs.get(patternName);
    if (!existing) {
      throw new Error(`Pattern not found: ${patternName}`);
    }

    const newConfig = { ...existing, ...updates };
    this.configs.set(patternName, newConfig);

    // Update circuit breaker if needed
    if (updates.circuitBreaker && this.circuitBreakers.has(patternName)) {
      // Circuit breakers typically can't be updated dynamically
      console.warn(`Circuit breaker config update for ${patternName} requires restart`);
    }

    // Update bulkhead if needed
    if (updates.bulkhead && this.bulkheads.has(patternName)) {
      const bulkhead = this.bulkheads.get(patternName)!;
      bulkhead.updateConfig(updates.bulkhead);
    }

    console.log(`Pattern updated: ${patternName}`);
  }

  removePattern(patternName: string): void {
    // Stop health check
    const healthCheckInterval = this.healthCheckIntervals.get(patternName);
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      this.healthCheckIntervals.delete(patternName);
    }

    // Remove components
    if (this.circuitBreakers.has(patternName)) {
      const cb = this.circuitBreakers.get(patternName)!;
      circuitBreakerRegistry.remove(cb.getName());
      this.circuitBreakers.delete(patternName);
    }

    if (this.bulkheads.has(patternName)) {
      const bulkhead = this.bulkheads.get(patternName)!;
      bulkheadRegistry.remove(bulkhead.getName());
      this.bulkheads.delete(patternName);
    }

    // Remove config and stats
    this.configs.delete(patternName);
    this.stats.delete(patternName);

    console.log(`Pattern removed: ${patternName}`);
  }

  // Utility methods
  isPatternHealthy(patternName: string): boolean {
    const stats = this.getPatternStats(patternName);

    // Consider healthy if uptime > 95% and no recent failures
    if (stats.uptime < 95) return false;

    // Check circuit breaker state
    if (stats.circuitBreaker && stats.circuitBreaker.state !== 'CLOSED') {
      return false;
    }

    // Check bulkhead capacity
    if (stats.bulkhead && stats.bulkhead.queuedRequests > stats.bulkhead.maxWaiting * 0.8) {
      return false;
    }

    return true;
  }

  getHealthyPatterns(): string[] {
    return Array.from(this.configs.keys()).filter((name) => this.isPatternHealthy(name));
  }

  getUnhealthyPatterns(): string[] {
    return Array.from(this.configs.keys()).filter((name) => !this.isPatternHealthy(name));
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    // Stop all health checks
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();

    // Shutdown bulkheads
    const bulkheadShutdowns = Array.from(this.bulkheads.values()).map((bulkhead) =>
      bulkhead.shutdown(),
    );

    // Shutdown circuit breakers
    const circuitBreakerShutdowns = Array.from(this.circuitBreakers.values()).map((cb) =>
      cb.shutdown(),
    );

    await Promise.all([...bulkheadShutdowns, ...circuitBreakerShutdowns]);

    this.removeAllListeners();
    console.log('Reliability manager shutdown complete');
  }
}

// Global instance
export const reliabilityManager = new ReliabilityManager();

// Utility decorator for applying reliability patterns
export function Reliable(
  patternName: string,
  options?: { timeout?: number; context?: Record<string, any> },
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return reliabilityManager.execute(patternName, () => method.apply(this, args), options);
    };

    return descriptor;
  };
}
