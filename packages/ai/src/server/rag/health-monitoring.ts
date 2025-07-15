/**
 * RAG Health Monitoring and Observability
 * Comprehensive monitoring, metrics, and health checks for RAG operations
 */

import { logError, logInfo } from '@repo/observability/server/next';
import { ragCircuitBreakerRegistry, type CircuitBreakerMetrics } from './circuit-breaker';
import type { RAGDatabaseBridge } from './database-bridge';

/**
 * Health status levels
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
}

/**
 * Component health information
 */
export interface ComponentHealth {
  status: HealthStatus;
  message: string;
  lastCheck: number;
  responseTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * RAG system metrics
 */
export interface RAGMetrics {
  operations: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
    throughput: number; // operations per minute
  };
  embeddings: {
    total: number;
    successful: number;
    failed: number;
    avgTokens: number;
    totalTokens: number;
    avgLatency: number;
  };
  vectorOperations: {
    queries: number;
    upserts: number;
    successful: number;
    failed: number;
    avgVectorCount: number;
    avgRelevanceScore: number;
  };
  circuitBreakers: Record<string, CircuitBreakerMetrics>;
  health: {
    overall: HealthStatus;
    components: Record<string, ComponentHealth>;
    lastHealthCheck: number;
  };
  performance: {
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    availabilityPercentage: number;
  };
}

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  timeout: number;
  retries: number;
  interval: number;
  thresholds: {
    responseTime: number;
    errorRate: number;
    circuitBreakerFailures: number;
  };
}

/**
 * RAG Health Monitor
 */
export class RAGHealthMonitor {
  private metrics: RAGMetrics;
  private config: Required<HealthCheckConfig>;
  private healthCheckInterval?: NodeJS.Timeout;
  private responseTimes: number[] = [];
  private recentOperations: Array<{ timestamp: number; success: boolean; responseTime: number }> =
    [];
  private lastHealthCheck: number = 0;

  constructor(
    private vectorStore: RAGDatabaseBridge,
    config: Partial<HealthCheckConfig> = {},
  ) {
    this.config = {
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      interval: config.interval || 60000, // 1 minute
      thresholds: {
        responseTime: config.thresholds?.responseTime || 5000,
        errorRate: config.thresholds?.errorRate || 0.1, // 10%
        circuitBreakerFailures: config.thresholds?.circuitBreakerFailures || 5,
        ...config.thresholds,
      },
    };

    this.metrics = this.initializeMetrics();
    this.startHealthChecks();

    logInfo('RAG Health Monitor initialized', {
      operation: 'rag_health_monitor_init',
      config: this.config,
    });
  }

  /**
   * Initialize metrics structure
   */
  private initializeMetrics(): RAGMetrics {
    return {
      operations: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        throughput: 0,
      },
      embeddings: {
        total: 0,
        successful: 0,
        failed: 0,
        avgTokens: 0,
        totalTokens: 0,
        avgLatency: 0,
      },
      vectorOperations: {
        queries: 0,
        upserts: 0,
        successful: 0,
        failed: 0,
        avgVectorCount: 0,
        avgRelevanceScore: 0,
      },
      circuitBreakers: {},
      health: {
        overall: HealthStatus.HEALTHY,
        components: {},
        lastHealthCheck: Date.now(),
      },
      performance: {
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        availabilityPercentage: 100,
      },
    };
  }

  /**
   * Record operation metrics
   */
  recordOperation(
    type: 'embedding' | 'vector_query' | 'vector_upsert' | 'batch',
    success: boolean,
    responseTime: number,
    metadata?: Record<string, any>,
  ): void {
    const now = Date.now();

    // Update overall operations
    this.metrics.operations.total++;
    if (success) {
      this.metrics.operations.successful++;
    } else {
      this.metrics.operations.failed++;
    }

    // Update response times
    this.responseTimes.push(responseTime);
    this.recentOperations.push({ timestamp: now, success, responseTime });

    // Keep only recent data (last hour)
    const oneHourAgo = now - 3600000;
    this.responseTimes = this.responseTimes.slice(-1000); // Keep last 1000 operations
    this.recentOperations = this.recentOperations.filter(op => op.timestamp > oneHourAgo);

    // Update specific operation type metrics
    switch (type) {
      case 'embedding':
        this.metrics.embeddings.total++;
        if (success) {
          this.metrics.embeddings.successful++;
          if (metadata?.tokens) {
            this.metrics.embeddings.totalTokens += metadata.tokens;
            this.metrics.embeddings.avgTokens =
              this.metrics.embeddings.totalTokens / this.metrics.embeddings.successful;
          }
        } else {
          this.metrics.embeddings.failed++;
        }
        this.metrics.embeddings.avgLatency = this.calculateAvgLatency('embedding');
        break;

      case 'vector_query':
        this.metrics.vectorOperations.queries++;
        if (success) {
          this.metrics.vectorOperations.successful++;
          if (metadata?.relevanceScore) {
            this.updateAvgRelevanceScore(metadata.relevanceScore);
          }
        } else {
          this.metrics.vectorOperations.failed++;
        }
        break;

      case 'vector_upsert':
        this.metrics.vectorOperations.upserts++;
        if (success) {
          this.metrics.vectorOperations.successful++;
          if (metadata?.vectorCount) {
            this.updateAvgVectorCount(metadata.vectorCount);
          }
        } else {
          this.metrics.vectorOperations.failed++;
        }
        break;
    }

    // Update performance metrics
    this.updatePerformanceMetrics();

    logInfo('RAG operation recorded', {
      operation: 'rag_health_monitor_record',
      type,
      success,
      responseTime,
      totalOperations: this.metrics.operations.total,
    });
  }

  /**
   * Calculate average latency for operation type
   */
  private calculateAvgLatency(_operationType: string): number {
    const relevantOps = this.recentOperations.filter(
      op =>
        // This is simplified - in practice you'd track operation types
        op.success && op.responseTime > 0,
    );

    if (relevantOps.length === 0) return 0;

    return relevantOps.reduce((sum, op) => sum + op.responseTime, 0) / relevantOps.length;
  }

  /**
   * Update average relevance score
   */
  private updateAvgRelevanceScore(score: number): void {
    const currentTotal =
      this.metrics.vectorOperations.avgRelevanceScore * (this.metrics.vectorOperations.queries - 1);
    this.metrics.vectorOperations.avgRelevanceScore =
      (currentTotal + score) / this.metrics.vectorOperations.queries;
  }

  /**
   * Update average vector count
   */
  private updateAvgVectorCount(count: number): void {
    const currentTotal =
      this.metrics.vectorOperations.avgVectorCount * (this.metrics.vectorOperations.upserts - 1);
    this.metrics.vectorOperations.avgVectorCount =
      (currentTotal + count) / this.metrics.vectorOperations.upserts;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    if (this.responseTimes.length === 0) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const length = sorted.length;

    this.metrics.performance.p50ResponseTime = sorted[Math.floor(length * 0.5)];
    this.metrics.performance.p95ResponseTime = sorted[Math.floor(length * 0.95)];
    this.metrics.performance.p99ResponseTime = sorted[Math.floor(length * 0.99)];

    // Calculate error rate from recent operations
    const recentFailures = this.recentOperations.filter(op => !op.success).length;
    this.metrics.performance.errorRate =
      this.recentOperations.length > 0 ? recentFailures / this.recentOperations.length : 0;

    // Calculate availability (inverse of error rate, but capped at 100%)
    this.metrics.performance.availabilityPercentage = Math.max(
      0,
      (1 - this.metrics.performance.errorRate) * 100,
    );

    // Calculate throughput (operations per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentOpsCount = this.recentOperations.filter(op => op.timestamp > oneMinuteAgo).length;
    this.metrics.operations.throughput = recentOpsCount;

    // Update average response time
    this.metrics.operations.avgResponseTime =
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<ComponentHealth[]> {
    const healthChecks: ComponentHealth[] = [];
    const now = Date.now();

    logInfo('Starting RAG health check', {
      operation: 'rag_health_check_start',
    });

    // Check vector store connectivity
    try {
      const startTime = Date.now();
      const storeInfo = await this.vectorStore.getStoreInfo();
      const responseTime = Date.now() - startTime;

      healthChecks.push({
        status:
          responseTime > this.config.thresholds.responseTime
            ? HealthStatus.DEGRADED
            : HealthStatus.HEALTHY,
        message: `Vector store responsive (${responseTime}ms)`,
        lastCheck: now,
        responseTime,
        metadata: storeInfo,
      });
    } catch (error) {
      healthChecks.push({
        status: HealthStatus.UNHEALTHY,
        message: 'Vector store connectivity failed',
        lastCheck: now,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Check circuit breakers
    const circuitBreakerMetrics = ragCircuitBreakerRegistry.getAllMetrics();
    this.metrics.circuitBreakers = circuitBreakerMetrics;

    const unhealthyBreakers = Object.entries(circuitBreakerMetrics)
      .filter(([_, metrics]) => metrics.state !== 'closed')
      .map(([name]) => name);

    if (unhealthyBreakers.length > 0) {
      healthChecks.push({
        status: HealthStatus.DEGRADED,
        message: `Circuit breakers open: ${unhealthyBreakers.join(', ')}`,
        lastCheck: now,
        metadata: { unhealthyBreakers, totalBreakers: Object.keys(circuitBreakerMetrics).length },
      });
    } else {
      healthChecks.push({
        status: HealthStatus.HEALTHY,
        message: 'All circuit breakers healthy',
        lastCheck: now,
        metadata: { totalBreakers: Object.keys(circuitBreakerMetrics).length },
      });
    }

    // Check performance thresholds
    const errorRate = this.metrics.performance.errorRate;
    const avgResponseTime = this.metrics.operations.avgResponseTime;

    if (errorRate > this.config.thresholds.errorRate) {
      healthChecks.push({
        status: HealthStatus.DEGRADED,
        message: `High error rate: ${(errorRate * 100).toFixed(2)}%`,
        lastCheck: now,
        metadata: { errorRate, threshold: this.config.thresholds.errorRate },
      });
    }

    if (avgResponseTime > this.config.thresholds.responseTime) {
      healthChecks.push({
        status: HealthStatus.DEGRADED,
        message: `High response time: ${avgResponseTime.toFixed(0)}ms`,
        lastCheck: now,
        metadata: { avgResponseTime, threshold: this.config.thresholds.responseTime },
      });
    }

    // Update health status in metrics
    const overallStatus = this.determineOverallHealth(healthChecks);
    this.metrics.health.overall = overallStatus;
    this.metrics.health.lastHealthCheck = now;

    // Store component health
    healthChecks.forEach((check, index) => {
      this.metrics.health.components[`check_${index}`] = check;
    });

    this.lastHealthCheck = now;

    logInfo('RAG health check completed', {
      operation: 'rag_health_check_complete',
      overallStatus,
      checksPerformed: healthChecks.length,
      unhealthyChecks: healthChecks.filter(c => c.status !== HealthStatus.HEALTHY).length,
    });

    return healthChecks;
  }

  /**
   * Determine overall health from component checks
   */
  private determineOverallHealth(checks: ComponentHealth[]): HealthStatus {
    if (checks.some(c => c.status === HealthStatus.CRITICAL)) {
      return HealthStatus.CRITICAL;
    }
    if (checks.some(c => c.status === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    }
    if (checks.some(c => c.status === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }
    return HealthStatus.HEALTHY;
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logError('Health check failed', {
          error: error instanceof Error ? error : new Error(String(error)),
          operation: 'rag_health_check_error',
        });
      }
    }, this.config.interval);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): RAGMetrics {
    return { ...this.metrics };
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    status: HealthStatus;
    message: string;
    lastCheck: number;
    metrics: {
      totalOperations: number;
      errorRate: number;
      avgResponseTime: number;
      availability: number;
    };
  } {
    return {
      status: this.metrics.health.overall,
      message: this.getHealthMessage(),
      lastCheck: this.lastHealthCheck,
      metrics: {
        totalOperations: this.metrics.operations.total,
        errorRate: this.metrics.performance.errorRate,
        avgResponseTime: this.metrics.operations.avgResponseTime,
        availability: this.metrics.performance.availabilityPercentage,
      },
    };
  }

  /**
   * Get health message based on current status
   */
  private getHealthMessage(): string {
    switch (this.metrics.health.overall) {
      case HealthStatus.HEALTHY:
        return 'All RAG systems operating normally';
      case HealthStatus.DEGRADED:
        return 'RAG systems experiencing degraded performance';
      case HealthStatus.UNHEALTHY:
        return 'RAG systems experiencing significant issues';
      case HealthStatus.CRITICAL:
        return 'RAG systems in critical state - immediate attention required';
      default:
        return 'RAG systems status unknown';
    }
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.responseTimes = [];
    this.recentOperations = [];

    logInfo('RAG metrics reset', {
      operation: 'rag_health_monitor_reset',
    });
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(): {
    timestamp: number;
    metrics: RAGMetrics;
    prometheus?: string;
  } {
    const timestamp = Date.now();

    // Optional: Generate Prometheus-style metrics
    const prometheus = this.generatePrometheusMetrics();

    return {
      timestamp,
      metrics: this.getMetrics(),
      prometheus,
    };
  }

  /**
   * Generate Prometheus-style metrics
   */
  private generatePrometheusMetrics(): string {
    const lines: string[] = [];
    const m = this.metrics;

    // Operations metrics
    lines.push(`rag_operations_total ${m.operations.total}`);
    lines.push(`rag_operations_successful ${m.operations.successful}`);
    lines.push(`rag_operations_failed ${m.operations.failed}`);
    lines.push(`rag_operations_avg_response_time_ms ${m.operations.avgResponseTime}`);
    lines.push(`rag_operations_throughput_per_minute ${m.operations.throughput}`);

    // Embedding metrics
    lines.push(`rag_embeddings_total ${m.embeddings.total}`);
    lines.push(`rag_embeddings_successful ${m.embeddings.successful}`);
    lines.push(`rag_embeddings_failed ${m.embeddings.failed}`);
    lines.push(`rag_embeddings_total_tokens ${m.embeddings.totalTokens}`);

    // Vector operation metrics
    lines.push(`rag_vector_queries ${m.vectorOperations.queries}`);
    lines.push(`rag_vector_upserts ${m.vectorOperations.upserts}`);
    lines.push(`rag_vector_avg_relevance_score ${m.vectorOperations.avgRelevanceScore}`);

    // Performance metrics
    lines.push(`rag_performance_p50_response_time_ms ${m.performance.p50ResponseTime}`);
    lines.push(`rag_performance_p95_response_time_ms ${m.performance.p95ResponseTime}`);
    lines.push(`rag_performance_p99_response_time_ms ${m.performance.p99ResponseTime}`);
    lines.push(`rag_performance_error_rate ${m.performance.errorRate}`);
    lines.push(`rag_performance_availability_percentage ${m.performance.availabilityPercentage}`);

    return lines.join('\n');
  }
}

/**
 * Global health monitor instance
 */
let globalHealthMonitor: RAGHealthMonitor | null = null;

/**
 * Initialize global health monitoring
 */
export function initializeRAGHealthMonitoring(
  vectorStore: RAGDatabaseBridge,
  config?: Partial<HealthCheckConfig>,
): RAGHealthMonitor {
  if (globalHealthMonitor) {
    globalHealthMonitor.stopHealthChecks();
  }

  globalHealthMonitor = new RAGHealthMonitor(vectorStore, config);
  return globalHealthMonitor;
}

/**
 * Get global health monitor
 */
export function getRAGHealthMonitor(): RAGHealthMonitor | null {
  return globalHealthMonitor;
}

/**
 * Convenience function to record operation
 */
export function recordRAGOperation(
  type: 'embedding' | 'vector_query' | 'vector_upsert' | 'batch',
  success: boolean,
  responseTime: number,
  metadata?: Record<string, any>,
): void {
  globalHealthMonitor?.recordOperation(type, success, responseTime, metadata);
}

/**
 * Decorator for automatic operation recording
 */
export function monitorRAGOperation(
  type: 'embedding' | 'vector_query' | 'vector_upsert' | 'batch',
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const method = descriptor.value;
    if (!method) throw new Error('Method descriptor value is undefined');

    descriptor.value = async function (this: any, ...args: any[]) {
      const startTime = Date.now();
      let success = false;
      let metadata: Record<string, any> | undefined;

      try {
        const result = await method.apply(this, args);
        success = true;

        // Extract metadata from result if available
        if (result && typeof result === 'object') {
          metadata = {
            tokens: result.tokens || result.embeddingTokens,
            vectorCount: result.count || result.ids?.length,
            relevanceScore: result.score || result.avgScore,
          };
        }

        return result;
      } finally {
        const responseTime = Date.now() - startTime;
        recordRAGOperation(type, success, responseTime, metadata);
      }
    } as T;
  };
}
